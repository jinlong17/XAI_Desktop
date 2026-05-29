#![cfg(feature = "crypto")]

use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use rusqlite::{params, Connection, OpenFlags};
use tauri::Manager;

use crate::error::{AppError, AppResult};

pub const DB_FILE_NAME: &str = "xai-repo-v0.db";
pub const RUNTIME_SCHEMA_VERSION: i64 = 1;

const CREATE_BOOTSTRAP_META_SQL: &str = "CREATE TABLE IF NOT EXISTS core_data_bootstrap_meta (\
    singleton_key INTEGER PRIMARY KEY CHECK (singleton_key = 1), \
    schema_version INTEGER NOT NULL, \
    migration_version INTEGER NOT NULL, \
    updated_at_ms INTEGER NOT NULL)";

const CREATE_MIGRATION_LOG_SQL: &str = "CREATE TABLE IF NOT EXISTS core_data_migration_log (\
    id TEXT PRIMARY KEY, \
    from_version INTEGER NOT NULL, \
    to_version INTEGER NOT NULL, \
    started_at_ms INTEGER NOT NULL, \
    completed_at_ms INTEGER NOT NULL, \
    applied INTEGER NOT NULL CHECK (applied IN (0, 1)))";

const CREATE_RECORDS_SQL: &str = "CREATE TABLE IF NOT EXISTS core_data_records (\
    namespace TEXT NOT NULL, \
    id TEXT NOT NULL, \
    json TEXT NOT NULL, \
    updated_at_ms INTEGER NOT NULL, \
    PRIMARY KEY (namespace, id))";

const SELECT_BOOTSTRAP_META_SQL: &str = "SELECT schema_version, migration_version \
    FROM core_data_bootstrap_meta WHERE singleton_key = 1";

const UPSERT_BOOTSTRAP_META_SQL: &str = "INSERT INTO core_data_bootstrap_meta \
    (singleton_key, schema_version, migration_version, updated_at_ms) \
    VALUES (1, ?1, ?2, ?3) \
    ON CONFLICT(singleton_key) DO UPDATE SET \
      schema_version = excluded.schema_version, \
      migration_version = excluded.migration_version, \
      updated_at_ms = excluded.updated_at_ms";

const INSERT_MIGRATION_LOG_SQL: &str = "INSERT INTO core_data_migration_log \
    (id, from_version, to_version, started_at_ms, completed_at_ms, applied) \
    VALUES (?1, ?2, ?3, ?4, ?5, 1) \
    ON CONFLICT(id) DO NOTHING";

const SELECT_MIGRATION_LOG_SQL: &str = "SELECT id, from_version, to_version, started_at_ms, completed_at_ms, applied \
    FROM core_data_migration_log ORDER BY to_version ASC, id ASC";

#[derive(Clone, Debug)]
pub struct DatabaseBootstrapMigration {
    pub id: String,
    pub from_version: i64,
    pub to_version: i64,
    pub started_at_ms: i64,
    pub completed_at_ms: i64,
    pub applied: bool,
}

#[derive(Clone, Debug)]
pub struct DatabaseBootstrapMetadata {
    pub path: PathBuf,
    pub schema_version: i64,
    pub migration_version: i64,
    pub migrations: Vec<DatabaseBootstrapMigration>,
    pub applied_in_this_bootstrap: Vec<DatabaseBootstrapMigration>,
}

struct MigrationDef {
    id: &'static str,
    from_version: i64,
    to_version: i64,
    sql: &'static str,
}

const MIGRATIONS: &[MigrationDef] = &[MigrationDef {
    id: "core-data-v1-records",
    from_version: 0,
    to_version: 1,
    sql: CREATE_RECORDS_SQL,
}];

fn max_known_migration_version() -> i64 {
    MIGRATIONS
        .iter()
        .map(|m| m.to_version)
        .max()
        .unwrap_or(0)
}

pub fn resolve_db_path(app: &tauri::AppHandle) -> AppResult<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|err| AppError::DatabaseBackend(format!("app_data_dir: {err}")))?;
    Ok(dir.join(DB_FILE_NAME))
}

pub fn open_and_bootstrap(path: &Path) -> AppResult<(Connection, DatabaseBootstrapMetadata)> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
    }

    let mut conn = Connection::open_with_flags(
        path,
        OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE,
    )
    .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

    conn.execute_batch(CREATE_BOOTSTRAP_META_SQL)
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
    conn.execute_batch(CREATE_MIGRATION_LOG_SQL)
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

    let now = now_ms();
    let mut schema_version = 0;
    let mut migration_version = 0;

    let existing: Result<(i64, i64), rusqlite::Error> = conn.query_row(
        SELECT_BOOTSTRAP_META_SQL,
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    );

    match existing {
        Ok((schema, migration)) => {
            schema_version = schema;
            migration_version = migration;
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            conn.execute(UPSERT_BOOTSTRAP_META_SQL, params![0_i64, 0_i64, now])
                .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
        }
        Err(err) => return Err(AppError::DatabaseBackend(err.to_string())),
    }

    let mut applied_in_this_bootstrap = Vec::new();

    for migration in MIGRATIONS {
        if migration.to_version <= migration_version {
            continue;
        }

        if migration.from_version != migration_version {
            return Err(AppError::DatabaseBootstrapContract(format!(
                "migration registry mismatch: expected from_version={} for `{}`, got {}",
                migration_version, migration.id, migration.from_version,
            )));
        }

        let started_at_ms = now_ms();
        let completed_at_ms = {
            let tx = conn
                .transaction()
                .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

            tx.execute_batch(migration.sql)
                .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

            let completed = now_ms();
            tx.execute(
                INSERT_MIGRATION_LOG_SQL,
                params![
                    migration.id,
                    migration.from_version,
                    migration.to_version,
                    started_at_ms,
                    completed,
                ],
            )
            .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

            tx.execute(
                UPSERT_BOOTSTRAP_META_SQL,
                params![RUNTIME_SCHEMA_VERSION, migration.to_version, completed],
            )
            .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

            tx.commit()
                .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
            completed
        };

        migration_version = migration.to_version;
        schema_version = RUNTIME_SCHEMA_VERSION;

        applied_in_this_bootstrap.push(DatabaseBootstrapMigration {
            id: migration.id.to_string(),
            from_version: migration.from_version,
            to_version: migration.to_version,
            started_at_ms,
            completed_at_ms,
            applied: true,
        });
    }

    let max_known = max_known_migration_version();
    if migration_version > max_known {
        return Err(AppError::DatabaseBootstrapContract(format!(
            "stored migration_version={} exceeds runtime registry max={max_known}",
            migration_version
        )));
    }

    if migration_version > 0 && schema_version < RUNTIME_SCHEMA_VERSION {
        schema_version = RUNTIME_SCHEMA_VERSION;
        conn.execute(
            UPSERT_BOOTSTRAP_META_SQL,
            params![schema_version, migration_version, now_ms()],
        )
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
    }

    let migrations = load_migration_log(&conn)?;

    Ok((
        conn,
        DatabaseBootstrapMetadata {
            path: path.to_path_buf(),
            schema_version,
            migration_version,
            migrations,
            applied_in_this_bootstrap,
        },
    ))
}

fn load_migration_log(conn: &Connection) -> AppResult<Vec<DatabaseBootstrapMigration>> {
    let mut stmt = conn
        .prepare(SELECT_MIGRATION_LOG_SQL)
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;
    let rows = stmt
        .query_map([], |row| {
            Ok(DatabaseBootstrapMigration {
                id: row.get(0)?,
                from_version: row.get(1)?,
                to_version: row.get(2)?,
                started_at_ms: row.get(3)?,
                completed_at_ms: row.get(4)?,
                applied: row.get::<_, i64>(5)? == 1,
            })
        })
        .map_err(|err| AppError::DatabaseBackend(err.to_string()))?;

    let mut out = Vec::new();
    for row in rows {
        out.push(row.map_err(|err| AppError::DatabaseBackend(err.to_string()))?);
    }
    Ok(out)
}

fn now_ms() -> i64 {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    duration.as_millis() as i64
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_db_path(name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!(
            "xai-bootstrap-{name}-{}-{nanos}.db",
            std::process::id(),
        ))
    }

    #[test]
    fn bootstraps_new_database_with_v1_metadata() {
        let path = temp_db_path("new");
        let (_conn, meta) = open_and_bootstrap(&path).unwrap();
        assert_eq!(meta.schema_version, RUNTIME_SCHEMA_VERSION);
        assert_eq!(meta.migration_version, 1);
        assert_eq!(meta.applied_in_this_bootstrap.len(), 1);
        assert_eq!(meta.migrations.len(), 1);
        assert_eq!(meta.migrations[0].id, "core-data-v1-records");
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn second_bootstrap_is_idempotent_and_does_not_reapply() {
        let path = temp_db_path("idempotent");
        open_and_bootstrap(&path).unwrap();
        let (_conn, second) = open_and_bootstrap(&path).unwrap();
        assert_eq!(second.schema_version, RUNTIME_SCHEMA_VERSION);
        assert_eq!(second.migration_version, 1);
        assert!(second.applied_in_this_bootstrap.is_empty());
        assert_eq!(second.migrations.len(), 1);
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn upgrades_old_fixture_with_zero_migration_version() {
        let path = temp_db_path("old-fixture");

        {
            let conn = Connection::open(&path).unwrap();
            conn.execute_batch(CREATE_BOOTSTRAP_META_SQL).unwrap();
            conn.execute_batch(CREATE_MIGRATION_LOG_SQL).unwrap();
            conn.execute(
                UPSERT_BOOTSTRAP_META_SQL,
                params![0_i64, 0_i64, now_ms()],
            )
            .unwrap();
        }

        let (_conn, meta) = open_and_bootstrap(&path).unwrap();
        assert_eq!(meta.migration_version, 1);
        assert_eq!(meta.applied_in_this_bootstrap.len(), 1);
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn contract_mismatch_surfaces_e1300_not_backend_error() {
        let path = temp_db_path("contract-mismatch");

        {
            let conn = Connection::open(&path).unwrap();
            conn.execute_batch(CREATE_BOOTSTRAP_META_SQL).unwrap();
            conn.execute_batch(CREATE_MIGRATION_LOG_SQL).unwrap();
            conn.execute(
                UPSERT_BOOTSTRAP_META_SQL,
                params![RUNTIME_SCHEMA_VERSION, 999_i64, now_ms()],
            )
            .unwrap();
        }

        let err = open_and_bootstrap(&path).unwrap_err();
        assert!(matches!(err, AppError::DatabaseBootstrapContract(_)));
        let _ = std::fs::remove_file(path);
    }
}
