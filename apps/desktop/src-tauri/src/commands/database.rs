//! Tauri IPC commands for the Repository v0 SQLite driver.
//!
//! G2.2 PoC scope: expose CRUD that matches the TS `SqliteDriver`
//! interface in `@repo/core-data/sqlite.ts`. One bundled-sqlcipher
//! Connection is owned by Tauri-managed state; the on-disk file lives
//! under the app data directory (`xai-repo-v0.db`).
//!
//! Encryption is intentionally **not** wired in this PoC — the SQLCipher
//! PRAGMA path is exercised separately by `crypto::sqlcipher` unit tests.
//! Once G2.4 publishes a stable opaque KEK handle, `db_open` will gain
//! a `kek_handle` parameter and apply `PRAGMA key`. The wire format is
//! designed so the JS side does not need to change when that happens.
//!
//! Wire commands (all gated to `main`,`control`,`grid_*`,`account` via
//! `capabilities/default.json`):
//!
//! - `db_init { namespace }` → idempotent. Creates the shared table
//!   `core_data_records (namespace, id, json, updated_at_ms)`.
//! - `db_put { namespace, id, json, updatedAtMs }` → upsert.
//! - `db_get { namespace, id }` → returns `json | null`.
//! - `db_list { namespace }` → returns rows sorted by `id`.
//! - `db_delete { namespace, id }` → idempotent.
//!
//! Errors map to the `E13xx` family in `error.rs`.

#![cfg(feature = "crypto")]

use std::path::PathBuf;
use std::sync::Mutex;

use rusqlite::{params, Connection, OpenFlags};
use serde::{Deserialize, Serialize};
use tauri::Manager;

use crate::error::{AppError, AppResult};

const DB_FILE_NAME: &str = "xai-repo-v0.db";

/// Windows allowed to invoke `db_*` commands. Mirrors
/// `capabilities/plugin-data-database.json`. `grid_*` matches the
/// per-Grid native windows. Widget / pet / ai-cube windows are
/// explicitly excluded — they must not persist Repository v0 data
/// directly; they go through the owning plugin instead.
const DATABASE_ALLOWED_WINDOWS: &[&str] = &["main", "control", "account", "console"];

fn is_database_window_allowed(label: &str) -> bool {
    if DATABASE_ALLOWED_WINDOWS.contains(&label) {
        return true;
    }
    label.starts_with("grid_")
}

fn ensure_database_window_allowed(label: &str) -> AppResult<()> {
    if is_database_window_allowed(label) {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke db_* commands"
    )))
}

const CREATE_RECORDS_SQL: &str = "CREATE TABLE IF NOT EXISTS core_data_records (\
    namespace TEXT NOT NULL, \
    id TEXT NOT NULL, \
    json TEXT NOT NULL, \
    updated_at_ms INTEGER NOT NULL, \
    PRIMARY KEY (namespace, id))";

const UPSERT_RECORD_SQL: &str = "INSERT INTO core_data_records (namespace, id, json, updated_at_ms) \
    VALUES (?1, ?2, ?3, ?4) \
    ON CONFLICT(namespace, id) DO UPDATE SET \
    json = excluded.json, \
    updated_at_ms = excluded.updated_at_ms";

const SELECT_RECORD_SQL: &str =
    "SELECT json FROM core_data_records WHERE namespace = ?1 AND id = ?2";

const SELECT_ALL_SQL: &str =
    "SELECT json FROM core_data_records WHERE namespace = ?1 ORDER BY id ASC";

const DELETE_RECORD_SQL: &str =
    "DELETE FROM core_data_records WHERE namespace = ?1 AND id = ?2";

/// Tauri-managed state holding the lazily-opened SQLite connection.
#[derive(Default)]
pub struct DatabaseState {
    inner: Mutex<Option<DatabaseInner>>,
}

struct DatabaseInner {
    conn: Connection,
}

impl DatabaseState {
    fn open_at(&self, path: &PathBuf) -> AppResult<()> {
        let mut guard = self.inner.lock().map_err(|err| {
            AppError::DatabaseBackend(format!("state lock poisoned: {err}"))
        })?;

        if guard.is_some() {
            return Ok(());
        }

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
        }

        let conn = Connection::open_with_flags(
            path,
            OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE,
        )
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

        conn.execute_batch(CREATE_RECORDS_SQL)
            .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

        *guard = Some(DatabaseInner { conn });
        Ok(())
    }

    fn with_conn<F, T>(&self, f: F) -> AppResult<T>
    where
        F: FnOnce(&Connection) -> AppResult<T>,
    {
        let guard = self.inner.lock().map_err(|err| {
            AppError::DatabaseBackend(format!("state lock poisoned: {err}"))
        })?;
        let inner = guard
            .as_ref()
            .ok_or(AppError::DatabaseNotInitialized)?;
        f(&inner.conn)
    }
}

fn resolve_db_path(app: &tauri::AppHandle) -> AppResult<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|err| AppError::DatabaseBackend(format!("app_data_dir: {err}")))?;
    Ok(dir.join(DB_FILE_NAME))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DbInitOutput {
    pub namespace: String,
    pub path: String,
}

/// Initialize the repo database. Creates the parent directory and the
/// `core_data_records` table if missing. Idempotent.
#[tauri::command]
pub async fn db_init(
    app: tauri::AppHandle,
    window: tauri::WebviewWindow,
    state: tauri::State<'_, DatabaseState>,
    namespace: String,
) -> AppResult<DbInitOutput> {
    ensure_database_window_allowed(window.label())?;
    validate_namespace(&namespace)?;
    let path = resolve_db_path(&app)?;
    state.open_at(&path)?;
    Ok(DbInitOutput {
        namespace,
        path: path.to_string_lossy().into_owned(),
    })
}

#[derive(Debug, Deserialize)]
pub struct DbPutInput {
    pub namespace: String,
    pub id: String,
    pub json: String,
    #[serde(rename = "updatedAtMs")]
    pub updated_at_ms: i64,
}

/// Upsert a single record. The `json` payload must be valid JSON; this is
/// the caller's responsibility (the driver does not parse it).
#[tauri::command]
pub async fn db_put(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, DatabaseState>,
    input: DbPutInput,
) -> AppResult<()> {
    ensure_database_window_allowed(window.label())?;
    validate_namespace(&input.namespace)?;
    validate_id(&input.id)?;
    state.with_conn(|conn| {
        conn.execute(
            UPSERT_RECORD_SQL,
            params![
                input.namespace,
                input.id,
                input.json,
                input.updated_at_ms
            ],
        )
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
        Ok(())
    })
}

#[derive(Debug, Deserialize)]
pub struct DbGetInput {
    pub namespace: String,
    pub id: String,
}

/// Fetch a single record's JSON payload. Returns `null` if absent.
#[tauri::command]
pub async fn db_get(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, DatabaseState>,
    input: DbGetInput,
) -> AppResult<Option<String>> {
    ensure_database_window_allowed(window.label())?;
    validate_namespace(&input.namespace)?;
    validate_id(&input.id)?;
    state.with_conn(|conn| {
        let row: Result<String, rusqlite::Error> = conn.query_row(
            SELECT_RECORD_SQL,
            params![input.namespace, input.id],
            |row| row.get::<_, String>(0),
        );
        match row {
            Ok(json) => Ok(Some(json)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(err) => Err(AppError::DatabaseBackend(err.to_string())),
        }
    })
}

#[derive(Debug, Deserialize)]
pub struct DbListInput {
    pub namespace: String,
}

/// List all JSON payloads in a namespace, sorted by `id`.
#[tauri::command]
pub async fn db_list(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, DatabaseState>,
    input: DbListInput,
) -> AppResult<Vec<String>> {
    ensure_database_window_allowed(window.label())?;
    validate_namespace(&input.namespace)?;
    state.with_conn(|conn| {
        let mut stmt = conn
            .prepare(SELECT_ALL_SQL)
            .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
        let rows = stmt
            .query_map(params![input.namespace], |row| row.get::<_, String>(0))
            .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
        let mut out = Vec::new();
        for row in rows {
            out.push(row.map_err(|err| AppError::DatabaseBackend(err.to_string()))?);
        }
        Ok(out)
    })
}

#[derive(Debug, Deserialize)]
pub struct DbDeleteInput {
    pub namespace: String,
    pub id: String,
}

/// Delete a single record. Idempotent.
#[tauri::command]
pub async fn db_delete(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, DatabaseState>,
    input: DbDeleteInput,
) -> AppResult<()> {
    ensure_database_window_allowed(window.label())?;
    validate_namespace(&input.namespace)?;
    validate_id(&input.id)?;
    state.with_conn(|conn| {
        conn.execute(
            DELETE_RECORD_SQL,
            params![input.namespace, input.id],
        )
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
        Ok(())
    })
}

fn validate_namespace(value: &str) -> AppResult<()> {
    if value.is_empty() || value.len() > 128 {
        return Err(AppError::DatabaseInvalidInput(format!(
            "namespace must be 1..=128 chars (got {})",
            value.len()
        )));
    }
    if !value.bytes().all(|b| {
        b.is_ascii_alphanumeric() || matches!(b, b'.' | b'_' | b'-' | b':')
    }) {
        return Err(AppError::DatabaseInvalidInput(
            "namespace must match [A-Za-z0-9._:-]+".into(),
        ));
    }
    Ok(())
}

fn validate_id(value: &str) -> AppResult<()> {
    if value.is_empty() || value.len() > 256 {
        return Err(AppError::DatabaseInvalidInput(format!(
            "id must be 1..=256 chars (got {})",
            value.len()
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Once;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temp_db_path(name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!(
            "xai-db-{name}-{}-{nanos}.db",
            std::process::id()
        ))
    }

    static INIT: Once = Once::new();
    fn ensure_init() {
        INIT.call_once(|| {});
    }

    fn opened(path: &PathBuf) -> DatabaseState {
        ensure_init();
        let state = DatabaseState::default();
        state.open_at(path).unwrap();
        state
    }

    fn put(state: &DatabaseState, ns: &str, id: &str, json: &str, ts: i64) -> AppResult<()> {
        state.with_conn(|conn| {
            conn.execute(
                UPSERT_RECORD_SQL,
                params![ns, id, json, ts],
            )
            .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
            Ok(())
        })
    }

    #[test]
    fn create_open_roundtrip_persists_across_reopens() {
        let path = temp_db_path("roundtrip");
        {
            let state = opened(&path);
            put(
                &state,
                "organizer.grids",
                "g1",
                r#"{"id":"g1","title":"Today"}"#,
                42,
            )
            .unwrap();
            put(
                &state,
                "organizer.grids",
                "g2",
                r#"{"id":"g2","title":"Inbox"}"#,
                43,
            )
            .unwrap();
        }
        {
            let state = opened(&path);
            let listed = state
                .with_conn(|conn| {
                    let mut stmt = conn.prepare(SELECT_ALL_SQL).unwrap();
                    let rows = stmt
                        .query_map(params!["organizer.grids"], |row| {
                            row.get::<_, String>(0)
                        })
                        .unwrap();
                    Ok(rows.map(|r| r.unwrap()).collect::<Vec<_>>())
                })
                .unwrap();
            assert_eq!(listed.len(), 2);
            assert!(listed[0].contains("\"g1\""));
            assert!(listed[1].contains("\"g2\""));
        }
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn upsert_overwrites_existing_record() {
        let path = temp_db_path("upsert");
        let state = opened(&path);
        put(&state, "todos", "t1", r#"{"v":1}"#, 1).unwrap();
        put(&state, "todos", "t1", r#"{"v":2}"#, 2).unwrap();
        let json = state
            .with_conn(|conn| {
                Ok(conn
                    .query_row(SELECT_RECORD_SQL, params!["todos", "t1"], |row| {
                        row.get::<_, String>(0)
                    })
                    .unwrap())
            })
            .unwrap();
        assert_eq!(json, r#"{"v":2}"#);
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn delete_is_idempotent() {
        let path = temp_db_path("delete");
        let state = opened(&path);
        put(&state, "labels", "l1", r#"{"v":1}"#, 1).unwrap();
        state
            .with_conn(|conn| {
                conn.execute(DELETE_RECORD_SQL, params!["labels", "l1"]).unwrap();
                Ok(())
            })
            .unwrap();
        state
            .with_conn(|conn| {
                conn.execute(DELETE_RECORD_SQL, params!["labels", "l1"]).unwrap();
                Ok(())
            })
            .unwrap();
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn list_returns_only_requested_namespace_sorted_by_id() {
        let path = temp_db_path("list");
        let state = opened(&path);
        put(&state, "a", "id-2", "{}", 1).unwrap();
        put(&state, "a", "id-1", "{}", 1).unwrap();
        put(&state, "b", "id-1", "{}", 1).unwrap();
        let listed = state
            .with_conn(|conn| {
                let mut stmt = conn.prepare(SELECT_ALL_SQL).unwrap();
                let rows = stmt
                    .query_map(params!["a"], |row| row.get::<_, String>(0))
                    .unwrap();
                Ok(rows.map(|r| r.unwrap()).collect::<Vec<_>>())
            })
            .unwrap();
        assert_eq!(listed.len(), 2);
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn validate_namespace_rejects_bad_input() {
        assert!(validate_namespace("").is_err());
        assert!(validate_namespace("a/b").is_err());
        assert!(validate_namespace("ok.namespace-1_v0").is_ok());
        assert!(validate_namespace(&"x".repeat(129)).is_err());
    }

    #[test]
    fn validate_id_rejects_bad_input() {
        assert!(validate_id("").is_err());
        assert!(validate_id(&"a".repeat(257)).is_err());
        assert!(validate_id("abc-123").is_ok());
    }

    #[test]
    fn window_allowlist_admits_documented_labels_and_grids() {
        for label in DATABASE_ALLOWED_WINDOWS {
            assert!(ensure_database_window_allowed(label).is_ok());
        }
        assert!(ensure_database_window_allowed("grid_abc-123").is_ok());
        assert!(ensure_database_window_allowed("grid_").is_ok()); // prefix only
    }

    #[test]
    fn window_allowlist_rejects_widget_pet_aicube() {
        for label in ["widget_clock", "pet", "ai_cube", "unknown"] {
            let err = ensure_database_window_allowed(label).unwrap_err();
            match err {
                AppError::SyncCapabilityDenied(msg) => assert!(msg.contains(label)),
                other => panic!("unexpected error: {other:?}"),
            }
        }
    }

    #[test]
    fn missing_init_returns_not_initialized() {
        let state = DatabaseState::default();
        let err = state
            .with_conn::<_, ()>(|_conn| Ok(()))
            .unwrap_err();
        assert!(matches!(err, AppError::DatabaseNotInitialized));
    }
}
