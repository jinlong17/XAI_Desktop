use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::{Mutex, OnceLock};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, Runtime, State, Wry};
use tauri_plugin_updater::{Error as UpdaterError, UpdaterExt};

const SNAPSHOT_EVENT_NAME: &str = "xai:desktop-updater-snapshot";
const DEFAULT_CHANNEL_ENV: &str = "XAI_DESKTOP_RELEASE_CHANNEL";
const ENDPOINT_ENV: &str = "XAI_DESKTOP_UPDATER_ENDPOINT";
const PUBKEY_ENV: &str = "XAI_DESKTOP_UPDATER_PUBKEY";

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum DesktopReleaseChannel {
    Disabled,
    InternalRc,
    InternalCanary,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum DesktopUpdaterAvailability {
    Disabled,
    Ready,
    Checking,
    UpdateAvailable,
    UpToDate,
    Error,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DesktopUpdaterReasonCode {
    ChannelDisabled,
    MissingEndpoint,
    PlaceholderEndpoint,
    MissingPubkey,
    PlaceholderPubkey,
    UpdaterNotConfigured,
    InstallUnavailable,
    NetworkError,
    InvalidManifest,
    SignatureError,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopUpdaterSnapshot {
    pub channel: DesktopReleaseChannel,
    pub current_version: String,
    pub availability: DesktopUpdaterAvailability,
    pub reason_code: Option<DesktopUpdaterReasonCode>,
    pub update_version: Option<String>,
    pub update_notes: Option<String>,
    pub last_checked_at: Option<String>,
}

impl Default for DesktopUpdaterSnapshot {
    fn default() -> Self {
        Self {
            channel: DesktopReleaseChannel::Disabled,
            current_version: "unknown".to_string(),
            availability: DesktopUpdaterAvailability::Disabled,
            reason_code: Some(DesktopUpdaterReasonCode::UpdaterNotConfigured),
            update_version: None,
            update_notes: None,
            last_checked_at: None,
        }
    }
}

pub struct DesktopUpdaterState {
    snapshot: Mutex<DesktopUpdaterSnapshot>,
}

impl Default for DesktopUpdaterState {
    fn default() -> Self {
        Self {
            snapshot: Mutex::new(DesktopUpdaterSnapshot::default()),
        }
    }
}

#[derive(Clone, Debug)]
struct ReadyUpdaterConfig {
    channel: DesktopReleaseChannel,
    endpoint: String,
    pubkey: String,
}

struct PreflightOutcome {
    snapshot: DesktopUpdaterSnapshot,
    ready: Option<ReadyUpdaterConfig>,
}

fn ensure_updater_window_allowed(label: &str) -> AppResult<()> {
    if label == "main" {
        return Ok(());
    }

    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke desktop_updater commands"
    )))
}

fn now_unix_seconds() -> String {
    let value = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    value.to_string()
}

fn current_version(app: &AppHandle<Wry>) -> String {
    app.package_info().version.to_string()
}

fn resolve_release_channel() -> DesktopReleaseChannel {
    let value = std::env::var(DEFAULT_CHANNEL_ENV).ok();
    parse_release_channel(value.as_deref())
}

fn parse_release_channel(value: Option<&str>) -> DesktopReleaseChannel {
    match value.map(|raw| raw.trim().to_ascii_lowercase()).as_deref() {
        Some("internal-rc") => DesktopReleaseChannel::InternalRc,
        Some("internal-canary") => DesktopReleaseChannel::InternalCanary,
        Some("disabled") | None => DesktopReleaseChannel::Disabled,
        Some(_) => DesktopReleaseChannel::Disabled,
    }
}

fn normalize_optional(value: Option<String>) -> Option<String> {
    value.and_then(|raw| {
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

fn first_endpoint_from_config(config: &Value) -> Option<String> {
    config
        .pointer("/plugins/updater/endpoints")
        .and_then(Value::as_array)
        .and_then(|items| items.first())
        .and_then(Value::as_str)
        .map(ToString::to_string)
}

fn pubkey_from_config(config: &Value) -> Option<String> {
    config
        .pointer("/plugins/updater/pubkey")
        .and_then(Value::as_str)
        .map(ToString::to_string)
}

fn tauri_conf_value() -> &'static Value {
    static CONFIG: OnceLock<Value> = OnceLock::new();
    CONFIG.get_or_init(|| {
        serde_json::from_str::<Value>(include_str!("../../tauri.conf.json"))
            .unwrap_or(Value::Null)
    })
}

fn resolve_endpoint() -> Option<String> {
    normalize_optional(
        std::env::var(ENDPOINT_ENV)
            .ok()
            .or_else(|| first_endpoint_from_config(tauri_conf_value())),
    )
}

fn resolve_pubkey() -> Option<String> {
    normalize_optional(
        std::env::var(PUBKEY_ENV)
            .ok()
            .or_else(|| pubkey_from_config(tauri_conf_value())),
    )
}

fn looks_placeholder_endpoint(value: &str) -> bool {
    let normalized = value.trim().to_ascii_lowercase();
    normalized.contains("example.invalid")
        || normalized.contains("placeholder")
        || normalized.contains("deferred")
}

fn looks_placeholder_pubkey(value: &str) -> bool {
    let normalized = value.trim().to_ascii_lowercase();
    normalized.contains("deferred")
        || normalized.contains("placeholder")
        || normalized.contains("example")
}

fn snapshot_with_reason(
    channel: DesktopReleaseChannel,
    current_version: String,
    availability: DesktopUpdaterAvailability,
    reason_code: Option<DesktopUpdaterReasonCode>,
) -> DesktopUpdaterSnapshot {
    DesktopUpdaterSnapshot {
        channel,
        current_version,
        availability,
        reason_code,
        update_version: None,
        update_notes: None,
        last_checked_at: None,
    }
}

fn run_preflight(app: &AppHandle<Wry>) -> PreflightOutcome {
    let channel = resolve_release_channel();
    let version = current_version(app);

    if channel == DesktopReleaseChannel::Disabled {
        return PreflightOutcome {
            snapshot: snapshot_with_reason(
                channel,
                version,
                DesktopUpdaterAvailability::Disabled,
                Some(DesktopUpdaterReasonCode::ChannelDisabled),
            ),
            ready: None,
        };
    }

    let endpoint = resolve_endpoint();
    let Some(endpoint) = endpoint else {
        return PreflightOutcome {
            snapshot: snapshot_with_reason(
                channel,
                version,
                DesktopUpdaterAvailability::Disabled,
                Some(DesktopUpdaterReasonCode::MissingEndpoint),
            ),
            ready: None,
        };
    };

    if looks_placeholder_endpoint(&endpoint) {
        return PreflightOutcome {
            snapshot: snapshot_with_reason(
                channel,
                version,
                DesktopUpdaterAvailability::Disabled,
                Some(DesktopUpdaterReasonCode::PlaceholderEndpoint),
            ),
            ready: None,
        };
    }

    let pubkey = resolve_pubkey();
    let Some(pubkey) = pubkey else {
        return PreflightOutcome {
            snapshot: snapshot_with_reason(
                channel,
                version,
                DesktopUpdaterAvailability::Disabled,
                Some(DesktopUpdaterReasonCode::MissingPubkey),
            ),
            ready: None,
        };
    };

    if looks_placeholder_pubkey(&pubkey) {
        return PreflightOutcome {
            snapshot: snapshot_with_reason(
                channel,
                version,
                DesktopUpdaterAvailability::Disabled,
                Some(DesktopUpdaterReasonCode::PlaceholderPubkey),
            ),
            ready: None,
        };
    }

    PreflightOutcome {
        snapshot: snapshot_with_reason(
            channel,
            version,
            DesktopUpdaterAvailability::Ready,
            None,
        ),
        ready: Some(ReadyUpdaterConfig {
            channel,
            endpoint,
            pubkey,
        }),
    }
}

fn publish_snapshot<R: Runtime>(
    app: &AppHandle<R>,
    snapshot: &DesktopUpdaterSnapshot,
) -> AppResult<()> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| AppError::Internal("main window not found".to_string()))?;

    let snapshot_json =
        serde_json::to_string(snapshot).map_err(|error| AppError::Internal(error.to_string()))?;
    let script = format!(
        "window.dispatchEvent(new CustomEvent({event_name:?}, {{ detail: {snapshot_json} }}));",
        event_name = SNAPSHOT_EVENT_NAME,
    );

    window
        .eval(script.as_str())
        .map_err(|error| AppError::Internal(error.to_string()))?;

    Ok(())
}

fn write_snapshot(
    app: &AppHandle<Wry>,
    state: &DesktopUpdaterState,
    snapshot: DesktopUpdaterSnapshot,
) -> AppResult<DesktopUpdaterSnapshot> {
    {
        let mut guard = state
            .snapshot
            .lock()
            .map_err(|error| AppError::Internal(error.to_string()))?;
        *guard = snapshot.clone();
    }
    publish_snapshot(app, &snapshot)?;
    Ok(snapshot)
}

fn refresh_preflight_snapshot(
    app: &AppHandle<Wry>,
    state: &DesktopUpdaterState,
) -> AppResult<PreflightOutcome> {
    let preflight = run_preflight(app);
    let _ = write_snapshot(app, state, preflight.snapshot.clone())?;
    Ok(preflight)
}

fn map_updater_error_reason(error: &UpdaterError) -> DesktopUpdaterReasonCode {
    match error {
        UpdaterError::Network(_) | UpdaterError::Reqwest(_) | UpdaterError::Http(_) => {
            DesktopUpdaterReasonCode::NetworkError
        }
        UpdaterError::ReleaseNotFound
        | UpdaterError::TargetNotFound(_)
        | UpdaterError::TargetsNotFound(_)
        | UpdaterError::Serialization(_) => DesktopUpdaterReasonCode::InvalidManifest,
        UpdaterError::Minisign(_)
        | UpdaterError::Base64(_)
        | UpdaterError::SignatureUtf8(_)
        | UpdaterError::InvalidUpdaterFormat
        | UpdaterError::AuthenticationFailed => DesktopUpdaterReasonCode::SignatureError,
        _ => DesktopUpdaterReasonCode::UpdaterNotConfigured,
    }
}

#[tauri::command]
pub async fn desktop_updater_get_snapshot(
    window: tauri::WebviewWindow,
    app: AppHandle<Wry>,
    state: State<'_, DesktopUpdaterState>,
) -> AppResult<DesktopUpdaterSnapshot> {
    ensure_updater_window_allowed(window.label())?;
    let preflight = refresh_preflight_snapshot(&app, state.inner())?;
    Ok(preflight.snapshot)
}

#[tauri::command]
pub async fn desktop_updater_check(
    window: tauri::WebviewWindow,
    app: AppHandle<Wry>,
    state: State<'_, DesktopUpdaterState>,
) -> AppResult<DesktopUpdaterSnapshot> {
    ensure_updater_window_allowed(window.label())?;

    let preflight = refresh_preflight_snapshot(&app, state.inner())?;
    let Some(ready) = preflight.ready else {
        return Ok(preflight.snapshot);
    };

    let checking = DesktopUpdaterSnapshot {
        channel: ready.channel,
        current_version: preflight.snapshot.current_version.clone(),
        availability: DesktopUpdaterAvailability::Checking,
        reason_code: None,
        update_version: None,
        update_notes: None,
        last_checked_at: Some(now_unix_seconds()),
    };
    let _ = write_snapshot(&app, state.inner(), checking.clone())?;

    let updater = {
        let builder = app.updater_builder();

        let endpoint_url = match ready.endpoint.parse() {
            Ok(url) => url,
            Err(_error) => {
                let snapshot = DesktopUpdaterSnapshot {
                    channel: ready.channel,
                    current_version: preflight.snapshot.current_version,
                    availability: DesktopUpdaterAvailability::Disabled,
                    reason_code: Some(DesktopUpdaterReasonCode::InvalidManifest),
                    update_version: None,
                    update_notes: None,
                    last_checked_at: Some(now_unix_seconds()),
                };
                return write_snapshot(&app, state.inner(), snapshot);
            }
        };

        let builder = match builder.endpoints(vec![endpoint_url]) {
            Ok(builder) => builder,
            Err(_error) => {
                let snapshot = DesktopUpdaterSnapshot {
                    channel: ready.channel,
                    current_version: preflight.snapshot.current_version,
                    availability: DesktopUpdaterAvailability::Disabled,
                    reason_code: Some(DesktopUpdaterReasonCode::UpdaterNotConfigured),
                    update_version: None,
                    update_notes: None,
                    last_checked_at: Some(now_unix_seconds()),
                };
                return write_snapshot(&app, state.inner(), snapshot);
            }
        };

        match builder.pubkey(ready.pubkey.clone()).build() {
            Ok(updater) => updater,
            Err(_error) => {
                let snapshot = DesktopUpdaterSnapshot {
                    channel: ready.channel,
                    current_version: preflight.snapshot.current_version,
                    availability: DesktopUpdaterAvailability::Disabled,
                    reason_code: Some(DesktopUpdaterReasonCode::UpdaterNotConfigured),
                    update_version: None,
                    update_notes: None,
                    last_checked_at: Some(now_unix_seconds()),
                };
                return write_snapshot(&app, state.inner(), snapshot);
            }
        }
    };

    let checked_at = Some(now_unix_seconds());

    match updater.check().await {
        Ok(Some(update)) => {
            let snapshot = DesktopUpdaterSnapshot {
                channel: ready.channel,
                current_version: preflight.snapshot.current_version,
                availability: DesktopUpdaterAvailability::UpdateAvailable,
                reason_code: Some(DesktopUpdaterReasonCode::InstallUnavailable),
                update_version: Some(update.version),
                update_notes: update.body,
                last_checked_at: checked_at,
            };
            write_snapshot(&app, state.inner(), snapshot)
        }
        Ok(None) => {
            let snapshot = DesktopUpdaterSnapshot {
                channel: ready.channel,
                current_version: preflight.snapshot.current_version,
                availability: DesktopUpdaterAvailability::UpToDate,
                reason_code: None,
                update_version: None,
                update_notes: None,
                last_checked_at: checked_at,
            };
            write_snapshot(&app, state.inner(), snapshot)
        }
        Err(error) => {
            let snapshot = DesktopUpdaterSnapshot {
                channel: ready.channel,
                current_version: preflight.snapshot.current_version,
                availability: DesktopUpdaterAvailability::Error,
                reason_code: Some(map_updater_error_reason(&error)),
                update_version: None,
                update_notes: None,
                last_checked_at: checked_at,
            };
            write_snapshot(&app, state.inner(), snapshot)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn placeholder_endpoint_is_rejected() {
        assert!(looks_placeholder_endpoint("https://updates.example.invalid/latest.json"));
        assert!(looks_placeholder_endpoint("https://placeholder.internal/latest.json"));
    }

    #[test]
    fn placeholder_pubkey_is_rejected() {
        assert!(looks_placeholder_pubkey("DEFERRED_TAURI_UPDATER_PUBLIC_KEY"));
        assert!(looks_placeholder_pubkey("placeholder_pubkey"));
    }

    #[test]
    fn release_channel_parser_matches_contract() {
        assert_eq!(
            parse_release_channel(Some("internal-canary")),
            DesktopReleaseChannel::InternalCanary
        );
        assert_eq!(
            parse_release_channel(Some("internal-rc")),
            DesktopReleaseChannel::InternalRc
        );
        assert_eq!(
            parse_release_channel(Some("disabled")),
            DesktopReleaseChannel::Disabled
        );
        assert_eq!(
            parse_release_channel(Some("unknown")),
            DesktopReleaseChannel::Disabled
        );
    }

    #[test]
    fn updater_error_mapping_matches_reason_contract() {
        let manifest_reason = map_updater_error_reason(&UpdaterError::ReleaseNotFound);
        assert_eq!(manifest_reason, DesktopUpdaterReasonCode::InvalidManifest);

        let network_reason = map_updater_error_reason(&UpdaterError::Network("down".to_string()));
        assert_eq!(network_reason, DesktopUpdaterReasonCode::NetworkError);

        let signature_reason = map_updater_error_reason(&UpdaterError::AuthenticationFailed);
        assert_eq!(signature_reason, DesktopUpdaterReasonCode::SignatureError);
    }

    #[test]
    fn normalize_optional_trims_empty_values() {
        assert_eq!(normalize_optional(Some("  x  ".to_string())).as_deref(), Some("x"));
        assert_eq!(normalize_optional(Some("  ".to_string())), None);
    }
}
