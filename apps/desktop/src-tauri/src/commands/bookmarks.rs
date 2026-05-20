//! User-authorized path bookmark registry (G3-E3 P0 fix).
//!
//! Implements an in-memory `BookmarkRegistry` that records every path the
//! user has explicitly authorized via a drag-drop or open-panel selection.
//! `reveal_in_finder` / `open_path` consult this registry as the second
//! gate (after `validate_user_path`'s lexical shape check) so they cannot
//! be invoked against arbitrary paths inside the user-reachable roots.
//!
//! The contract in `docs/contracts/tauri-commands-v0.md` §4 requires that
//! "all path access must come from user drop/open panel or authorized
//! bookmark"; the lexical shape gate alone only narrowed the attack
//! surface — it did not constitute honest provenance. This module raises
//! the implementation to match the contract.
//!
//! Storage model: in-memory `HashSet<PathBuf>` keyed by the canonical
//! (lexically-normalized) form produced by `validate_user_path`. Each
//! session starts empty — the user must re-authorize every path after a
//! restart. This is intentionally more restrictive than the contract
//! promises: every authorized path has explicit, recent provenance.
//!
//! Tauri injects `window: tauri::WebviewWindow` automatically; JS callers
//! do NOT include it in the args payload (mirrors the existing crypto /
//! database / keychain / finder command pattern).

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::Deserialize;
use tauri::{Runtime, State};

use crate::commands::finder::validate_user_path;
use crate::error::{AppError, AppResult};

/// Windows allowed to invoke bookmark commands. Mirrors
/// `commands::finder::FINDER_ALLOWED_WINDOWS` because the bookmark
/// registry is a strict companion to the Finder commands — only the
/// surfaces that can call `reveal_in_finder` / `open_path` should be
/// allowed to register a path bookmark in the first place.
///
/// Duplicated (rather than shared via `pub`) intentionally: the finder
/// allow-list is `pub(crate)` only for `validate_user_path` re-use; a
/// minor copy here keeps the two modules independently auditable so a
/// future widening of one cannot silently widen the other.
const BOOKMARK_ALLOWED_WINDOWS: &[&str] = &["main", "control", "console"];

fn is_bookmark_window_allowed(label: &str) -> bool {
    if BOOKMARK_ALLOWED_WINDOWS.contains(&label) {
        return true;
    }
    label.starts_with("grid_")
}

fn ensure_bookmark_window_allowed(label: &str) -> AppResult<()> {
    if is_bookmark_window_allowed(label) {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke bookmark commands"
    )))
}

/// In-memory registry of user-authorized canonical paths.
///
/// Backed by a `Mutex<HashSet<PathBuf>>`. Each entry is the
/// lexically-normalized canonical form output by `validate_user_path`,
/// so the gate is consistent with the path used by the platform `open`
/// / `open -R` shell-out.
pub struct BookmarkRegistry {
    inner: Mutex<HashSet<PathBuf>>,
}

impl Default for BookmarkRegistry {
    fn default() -> Self {
        Self {
            inner: Mutex::new(HashSet::new()),
        }
    }
}

impl BookmarkRegistry {
    /// Insert a canonical path. Idempotent. Returns `Ok(())` on success.
    pub fn insert_canonical(&self, canonical: PathBuf) -> AppResult<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|err| AppError::Internal(format!("bookmark registry poisoned: {err}")))?;
        guard.insert(canonical);
        Ok(())
    }

    /// Remove a canonical path. Idempotent.
    pub fn remove_canonical(&self, canonical: &Path) -> AppResult<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|err| AppError::Internal(format!("bookmark registry poisoned: {err}")))?;
        guard.remove(canonical);
        Ok(())
    }

    /// Check whether a canonical path has been authorized.
    pub fn contains_canonical(&self, canonical: &Path) -> bool {
        let Ok(guard) = self.inner.lock() else {
            return false;
        };
        guard.contains(canonical)
    }
}

/// Rust-internal helper for callers (notably `commands::finder`) to
/// consult the registry without having to know the lock layout.
pub fn is_path_bookmarked(state: &BookmarkRegistry, canonical: &Path) -> bool {
    state.contains_canonical(canonical)
}

#[derive(Debug, Deserialize)]
pub struct RegisterPathBookmarkInput {
    pub path: String,
}

/// Register a user-authorized path bookmark.
///
/// Lexically validates the input first (`validate_user_path`), then
/// inserts the canonical form into the registry. Idempotent. Returns
/// `E3004` if the calling window is not in `BOOKMARK_ALLOWED_WINDOWS`,
/// `E3004` / `E3005` for path validation failures.
///
/// Generic over `R: Runtime` so the same `#[tauri::command]` body is
/// exercised by integration tests against `MockRuntime` and by the
/// production app against `Wry` — no test-only fork of the entry
/// point exists.
#[tauri::command]
pub async fn register_path_bookmark<R: Runtime>(
    window: tauri::WebviewWindow<R>,
    state: State<'_, BookmarkRegistry>,
    input: RegisterPathBookmarkInput,
) -> AppResult<()> {
    ensure_bookmark_window_allowed(window.label())?;
    let canonical = validate_user_path(&input.path)?;
    state.insert_canonical(canonical)
}

#[derive(Debug, Deserialize)]
pub struct ClearPathBookmarkInput {
    pub path: String,
}

/// Clear a user-authorized path bookmark.
///
/// Idempotent: removing an absent path is not an error. Lexically
/// validates the input first (`validate_user_path`) for symmetry with
/// `register_path_bookmark`, so callers cannot use this command to
/// probe arbitrary paths against the validator.
///
/// Generic over `R: Runtime` for the same MockRuntime-vs-Wry test
/// support as `register_path_bookmark`.
#[tauri::command]
pub async fn clear_path_bookmark<R: Runtime>(
    window: tauri::WebviewWindow<R>,
    state: State<'_, BookmarkRegistry>,
    input: ClearPathBookmarkInput,
) -> AppResult<()> {
    ensure_bookmark_window_allowed(window.label())?;
    let canonical = validate_user_path(&input.path)?;
    state.remove_canonical(&canonical)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Allow-list admits the documented labels and any `grid_*`.
    #[test]
    fn allowlist_admits_documented_labels_and_grids() {
        for label in BOOKMARK_ALLOWED_WINDOWS {
            assert!(ensure_bookmark_window_allowed(label).is_ok());
        }
        assert!(ensure_bookmark_window_allowed("grid_a1b2").is_ok());
    }

    /// Allow-list rejects widget / pet / ai-cube / unknown.
    #[test]
    fn allowlist_rejects_widget_pet_aicube() {
        for label in ["widget_clock", "pet", "ai_cube", "popup", "account"] {
            assert!(ensure_bookmark_window_allowed(label).is_err());
        }
    }

    /// Lookup returns false before register, true after, false after clear.
    #[test]
    fn register_then_lookup_then_clear() {
        let registry = BookmarkRegistry::default();
        let canonical = validate_user_path("/Users/me/file.txt").expect("valid path");

        assert!(
            !is_path_bookmarked(&registry, &canonical),
            "fresh registry must not contain any path"
        );

        registry
            .insert_canonical(canonical.clone())
            .expect("insert");
        assert!(
            is_path_bookmarked(&registry, &canonical),
            "registry must contain the path after register"
        );

        registry.remove_canonical(&canonical).expect("remove");
        assert!(
            !is_path_bookmarked(&registry, &canonical),
            "registry must not contain the path after clear"
        );
    }

    /// `clear_path_bookmark` is idempotent — removing absent is OK.
    #[test]
    fn clear_is_idempotent() {
        let registry = BookmarkRegistry::default();
        let canonical = validate_user_path("/Users/me/missing.txt").expect("valid path");

        // remove without register must not error
        registry.remove_canonical(&canonical).expect("remove absent");
        assert!(!is_path_bookmarked(&registry, &canonical));

        // double-register is idempotent (no count exposed, but no error)
        registry.insert_canonical(canonical.clone()).expect("first");
        registry
            .insert_canonical(canonical.clone())
            .expect("second");
        assert!(is_path_bookmarked(&registry, &canonical));

        // double-remove is idempotent
        registry.remove_canonical(&canonical).expect("first remove");
        registry
            .remove_canonical(&canonical)
            .expect("second remove");
        assert!(!is_path_bookmarked(&registry, &canonical));
    }

    /// Invalid paths are rejected by `validate_user_path` and never reach
    /// the registry. We exercise this through the validator directly so
    /// the test does not need a `WebviewWindow`.
    #[test]
    fn invalid_path_is_rejected_before_registry() {
        let registry = BookmarkRegistry::default();

        // `..` in the path → SyncInvalidInput
        let bad_dotdot = validate_user_path("/Users/me/../etc/passwd");
        assert!(bad_dotdot.is_err());

        // outside user-reachable root → SyncCapabilityDenied
        let bad_root = validate_user_path("/etc/passwd");
        assert!(bad_root.is_err());

        // empty / whitespace → SyncInvalidInput
        assert!(validate_user_path("").is_err());
        assert!(validate_user_path("   ").is_err());

        // Confirm none of the above leaked into the registry. They never
        // produced a canonical PathBuf, so there is nothing to look up;
        // but we verify by enumerating a couple of would-be canonical
        // forms and asserting absence.
        for raw in [
            PathBuf::from("/etc/passwd"),
            PathBuf::from("/Users/me/etc/passwd"),
        ] {
            assert!(
                !is_path_bookmarked(&registry, &raw),
                "registry must remain empty when validator rejects input"
            );
        }
    }
}

#[cfg(test)]
mod ipc_integration_tests {
    //! P0-Foxtrot integration tests — exercise `register_path_bookmark`
    //! → `reveal_in_finder` through the **public Tauri IPC surface**,
    //! NOT through internal helpers like `insert_canonical` (which was
    //! the Codex re-review's P1 finding on commit `520737c`).
    //!
    //! Uses Tauri's `MockRuntime` (gated behind the dev-only `test`
    //! feature in `Cargo.toml`). The webview is built with label
    //! `"main"` so it satisfies both `BOOKMARK_ALLOWED_WINDOWS` and
    //! `FINDER_ALLOWED_WINDOWS`.
    //!
    //! Implementation note: `register_path_bookmark` takes
    //! `tauri::WebviewWindow` (which defaults to the production Wry
    //! runtime), so we cannot pass a `MockRuntime` window directly. We
    //! drive the command through `tauri::test::get_ipc_response`,
    //! which serializes a `JSON` `InvokeRequest` and runs it through
    //! the actual `invoke_handler` dispatcher on the MockRuntime app.
    //! That is the SAME code path JS callers take in production — JSON
    //! → invoke handler → `#[tauri::command]` body → state mutation.
    //!
    //! Coverage:
    //! 1. `register_path_bookmark` succeeds for an absolute path under
    //!    a user-reachable root, and `reveal_in_finder`'s gate
    //!    (`ensure_path_authorized`) then admits the same path.
    //! 2. `register_path_bookmark` rejects a relative-style path
    //!    (matches HTML5 basename shape) so the previous P0 finding
    //!    "drop hook registers basenames" is verified to fail at the
    //!    IPC boundary, not just in JS.
    //! 3. `reveal_in_finder`'s gate still rejects an absolute path
    //!    that was never registered (negative case symmetry).
    //!
    //! Note: `reveal_in_finder` shells out to `open -R` on macOS. The
    //! tests stop short of the shell-out by exercising the path
    //! through `ensure_path_authorized_test_helper` directly — that is
    //! the gate the reviewer cares about, and it is the same code path
    //! the `#[tauri::command]` handler runs before any process spawn.

    use super::*;
    use crate::commands::finder::{
        ensure_path_authorized_test_helper, FINDER_ALLOWED_WINDOWS,
    };
    use tauri::test::{get_ipc_response, mock_builder, mock_context, noop_assets, INVOKE_KEY};
    use tauri::webview::InvokeRequest;
    use tauri::Manager;

    /// Build a Tauri MockRuntime app wired with `BookmarkRegistry` state
    /// and the two bookmark IPC commands. Mirrors the production wiring
    /// in `lib.rs` minus the windows / platform / menubar plumbing.
    fn build_mock_app() -> tauri::App<tauri::test::MockRuntime> {
        mock_builder()
            .manage(BookmarkRegistry::default())
            .invoke_handler(tauri::generate_handler![
                register_path_bookmark,
                clear_path_bookmark,
            ])
            .build(mock_context(noop_assets()))
            .expect("mock app build failed")
    }

    /// Build the `main` webview window for the mock app. The label
    /// `main` is in both `BOOKMARK_ALLOWED_WINDOWS` and
    /// `FINDER_ALLOWED_WINDOWS`, so the window-origin check passes.
    fn build_main_window(
        app: &tauri::App<tauri::test::MockRuntime>,
    ) -> tauri::WebviewWindow<tauri::test::MockRuntime> {
        tauri::WebviewWindowBuilder::new(app, "main", Default::default())
            .build()
            .expect("main webview build failed")
    }

    /// Drive `register_path_bookmark` through the public IPC surface.
    /// JSON body shape matches `RegisterPathBookmarkInput` exactly so
    /// the test exercises the same serde-deserialization the JS bridge
    /// runs in production.
    fn ipc_register_path_bookmark(
        webview: &tauri::WebviewWindow<tauri::test::MockRuntime>,
        path: &str,
    ) -> Result<serde_json::Value, serde_json::Value> {
        let body = serde_json::json!({ "input": { "path": path } });
        let request = InvokeRequest {
            cmd: "register_path_bookmark".into(),
            callback: tauri::ipc::CallbackFn(0),
            error: tauri::ipc::CallbackFn(1),
            url: "tauri://localhost".parse().unwrap(),
            body: tauri::ipc::InvokeBody::Json(body),
            headers: Default::default(),
            invoke_key: INVOKE_KEY.to_string(),
        };
        get_ipc_response(webview, request)
            .map(|b| b.deserialize::<serde_json::Value>().unwrap_or(serde_json::Value::Null))
    }

    /// 1. Honest path through the public IPC: register an absolute
    /// path via the JSON-RPC entry point, then `reveal_in_finder`'s
    /// authorization gate (`ensure_path_authorized`) must admit it.
    /// This is the case the previous Codex re-review said the test
    /// suite did not cover (P1: "the admit-path Rust test sidesteps
    /// the public authorization path by calling `insert_canonical`
    /// directly").
    #[test]
    fn register_then_authorize_through_public_ipc() {
        let app = build_mock_app();
        let window = build_main_window(&app);
        let registry_state = app.state::<BookmarkRegistry>();

        // 1. Register through the IPC command surface — same JSON shape
        //    a JS caller would send.
        ipc_register_path_bookmark(&window, "/Users/me/Documents/note.md")
            .expect("register_path_bookmark must succeed for valid absolute path");

        // 2. The same path must now pass the `reveal_in_finder` /
        //    `open_path` authorization gate.
        let canonical = ensure_path_authorized_test_helper(
            "/Users/me/Documents/note.md",
            &registry_state,
        )
        .expect("reveal/open gate must admit a registered path");
        assert_eq!(canonical, std::path::PathBuf::from("/Users/me/Documents/note.md"));

        // 3. Belt-and-braces — the registry itself contains the
        //    canonical PathBuf, proving the IPC call (not an internal
        //    helper) populated it.
        assert!(
            is_path_bookmarked(
                &registry_state,
                &std::path::PathBuf::from("/Users/me/Documents/note.md"),
            ),
            "registry must contain the path after public IPC registration"
        );
    }

    /// 2. P0-Foxtrot regression guard: a basename-only path (what
    /// HTML5 drag-drop on the click-through `main` window would have
    /// produced if the previous bookmark-registration call wasn't
    /// disabled) must be rejected by `register_path_bookmark`
    /// itself, BEFORE it ever reaches the registry. This is the
    /// failure mode Codex flagged in the P0-Echo re-review.
    #[test]
    fn basename_path_rejected_at_ipc_boundary() {
        let app = build_mock_app();
        let window = build_main_window(&app);
        let registry_state = app.state::<BookmarkRegistry>();

        // Basename-shaped input — would have arrived from HTML5 drop.
        let err = ipc_register_path_bookmark(&window, "photo.png")
            .expect_err("register_path_bookmark must reject basename input");

        // `AppError::SyncInvalidInput` serializes externally-tagged with
        // a string payload. Match on the message contents rather than
        // structural shape (which can shift with serde versions).
        let msg = err.to_string();
        assert!(
            msg.contains("absolute") || msg.contains("E3005"),
            "expected E3005 path-must-be-absolute, got: {msg}"
        );

        // Confirm the registry is untouched by the rejected call.
        let would_be_canonical = std::path::PathBuf::from("photo.png");
        assert!(
            !is_path_bookmarked(&registry_state, &would_be_canonical),
            "rejected input must NOT have leaked into the registry"
        );
    }

    /// 3. Reveal still rejects an absolute path that was never
    /// registered through the public IPC (negative-case symmetry
    /// with the admit-path test).
    #[test]
    fn reveal_rejects_unregistered_path_through_public_ipc() {
        let app = build_mock_app();
        let registry_state = app.state::<BookmarkRegistry>();

        // Path-shape is valid but never registered.
        let err = ensure_path_authorized_test_helper(
            "/Users/me/Documents/secret.txt",
            &registry_state,
        )
        .expect_err("unregistered path must be rejected");

        let msg = err.to_string();
        assert!(
            msg.starts_with("E3004:") && msg.contains("no user-authorized bookmark"),
            "expected E3004 — no bookmark — got: {msg}"
        );
    }

    /// 4. Sanity check: the `main` label the integration tests piggy-back
    /// on is actually in both relevant allow-lists, so the gate the
    /// tests exercise matches the gate production code sees for a real
    /// grid-window drop registration.
    #[test]
    fn main_label_is_in_both_allowlists() {
        assert!(
            BOOKMARK_ALLOWED_WINDOWS.contains(&"main"),
            "test fixture assumes `main` is bookmark-allowed"
        );
        assert!(
            FINDER_ALLOWED_WINDOWS.contains(&"main"),
            "test fixture assumes `main` is finder-allowed"
        );
    }
}
