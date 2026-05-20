//! Tauri IPC commands for Sync crypto.
//!
//! Command handlers expose opaque handles and encrypted envelopes only. Raw key
//! bytes never cross IPC; Rust resolves handles inside `CryptoCommandState`.

use crate::error::{AppError, AppResult};

#[cfg(feature = "crypto")]
use crate::crypto::{
    aad::{
        encode_blob_aad, encode_recovery_message_aad, encode_wrap_aad, BlobAad, RecoveryMessageAad,
        WrapAad,
    },
    envelope::{serialize_envelope, CipherEnvelope},
    hpke_wrap::{open_dek_wrap_into_vault, seal_dek_for_device, DeviceDekWrap},
    key_vault::{KeyHandleId, KeyVault},
    recovery_signing::sign_recovery_transcript,
};

#[cfg(feature = "crypto")]
use std::sync::Mutex;
#[cfg(feature = "crypto")]
use std::time::{SystemTime, UNIX_EPOCH};

#[cfg(feature = "crypto")]
const SCHEMA_VERSION: u64 = 1;
#[cfg(feature = "crypto")]
const WRAP_AAD_CONTEXT: &[u8] = b"xai.device_dek_wraps.v1";

const CRYPTO_ALLOWED_WINDOWS: &[&str] = &["account", "control"];

#[derive(Debug, serde::Deserialize)]
#[cfg_attr(not(feature = "crypto"), allow(dead_code))]
#[serde(rename_all = "camelCase")]
pub struct DevicePublicInput {
    pub target_device_id: Vec<u8>,
    pub device_pub: Vec<u8>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceDekWrapEnvelope {
    pub target_device_id: Vec<u8>,
    pub encapped_key: Vec<u8>,
    pub ciphertext: Vec<u8>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecoverySignatureOutput {
    pub recovery_signing_pub: Vec<u8>,
    pub signature: Vec<u8>,
    pub transcript_cbor: Vec<u8>,
}

#[derive(Debug, Default)]
pub struct CryptoCommandState {
    #[cfg(feature = "crypto")]
    runtime: Mutex<CryptoRuntimeState>,
}

#[cfg(feature = "crypto")]
#[derive(Debug)]
struct CryptoRuntimeState {
    vault: KeyVault,
    active_dek_handle: Option<KeyHandleId>,
    active_device_priv_handle: Option<KeyHandleId>,
    account_id: [u8; 16],
    encryption_device_id: u64,
    granted_by_device_id: [u8; 16],
    key_id: u32,
    next_counter: u32,
}

#[cfg(feature = "crypto")]
impl Default for CryptoRuntimeState {
    fn default() -> Self {
        Self {
            vault: KeyVault::new(),
            active_dek_handle: None,
            active_device_priv_handle: None,
            account_id: [0u8; 16],
            encryption_device_id: 0,
            granted_by_device_id: [0u8; 16],
            key_id: 1,
            next_counter: 1,
        }
    }
}

#[tauri::command]
pub async fn crypto_encrypt_for(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, CryptoCommandState>,
    entity_type: String,
    entity_id: String,
    proposed_revision: u64,
    plaintext: Vec<u8>,
) -> AppResult<Vec<u8>> {
    crypto_encrypt_for_inner(
        window.label(),
        &state,
        entity_type,
        entity_id,
        proposed_revision,
        plaintext,
    )
}

#[tauri::command]
pub async fn crypto_wrap_dek_for_devices(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, CryptoCommandState>,
    dek_handle: u32,
    device_pubs: Vec<DevicePublicInput>,
) -> AppResult<Vec<DeviceDekWrapEnvelope>> {
    crypto_wrap_dek_for_devices_inner(window.label(), &state, dek_handle, device_pubs)
}

#[tauri::command]
pub async fn crypto_unwrap_dek_for_device(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, CryptoCommandState>,
    wrap_envelope: DeviceDekWrapEnvelope,
) -> AppResult<u32> {
    crypto_unwrap_dek_for_device_inner(window.label(), &state, wrap_envelope)
}

#[tauri::command]
pub async fn crypto_recovery_sign(
    window: tauri::WebviewWindow,
    state: tauri::State<'_, CryptoCommandState>,
    challenge: Vec<u8>,
    new_payload_hash: Vec<u8>,
) -> AppResult<RecoverySignatureOutput> {
    crypto_recovery_sign_inner(window.label(), &state, challenge, new_payload_hash)
}

fn ensure_crypto_window_allowed(label: &str) -> AppResult<()> {
    if CRYPTO_ALLOWED_WINDOWS.contains(&label) {
        return Ok(());
    }
    Err(AppError::SyncCapabilityDenied(format!(
        "window `{label}` is not allowed to invoke crypto_* commands"
    )))
}

#[cfg(not(feature = "crypto"))]
fn crypto_encrypt_for_inner(
    label: &str,
    _state: &CryptoCommandState,
    _entity_type: String,
    _entity_id: String,
    _proposed_revision: u64,
    _plaintext: Vec<u8>,
) -> AppResult<Vec<u8>> {
    ensure_crypto_window_allowed(label)?;
    Err(AppError::SyncCryptoNotInitialized)
}

#[cfg(not(feature = "crypto"))]
fn crypto_wrap_dek_for_devices_inner(
    label: &str,
    _state: &CryptoCommandState,
    _dek_handle: u32,
    _device_pubs: Vec<DevicePublicInput>,
) -> AppResult<Vec<DeviceDekWrapEnvelope>> {
    ensure_crypto_window_allowed(label)?;
    Err(AppError::SyncCryptoNotInitialized)
}

#[cfg(not(feature = "crypto"))]
fn crypto_unwrap_dek_for_device_inner(
    label: &str,
    _state: &CryptoCommandState,
    _wrap_envelope: DeviceDekWrapEnvelope,
) -> AppResult<u32> {
    ensure_crypto_window_allowed(label)?;
    Err(AppError::SyncCryptoNotInitialized)
}

#[cfg(not(feature = "crypto"))]
fn crypto_recovery_sign_inner(
    label: &str,
    _state: &CryptoCommandState,
    _challenge: Vec<u8>,
    _new_payload_hash: Vec<u8>,
) -> AppResult<RecoverySignatureOutput> {
    ensure_crypto_window_allowed(label)?;
    Err(AppError::SyncCryptoNotInitialized)
}

#[cfg(feature = "crypto")]
fn crypto_encrypt_for_inner(
    label: &str,
    state: &CryptoCommandState,
    entity_type: String,
    entity_id: String,
    proposed_revision: u64,
    plaintext: Vec<u8>,
) -> AppResult<Vec<u8>> {
    ensure_crypto_window_allowed(label)?;
    let mut runtime = state.runtime.lock().map_err(lock_error)?;
    let dek_handle = runtime
        .active_dek_handle
        .ok_or(AppError::SyncCryptoNotInitialized)?;
    let counter = runtime.next_counter;
    runtime.next_counter = runtime
        .next_counter
        .checked_add(1)
        .ok_or_else(|| AppError::SyncCrypto("encryption counter exhausted".into()))?;

    let aad = encode_blob_aad(&BlobAad {
        account_id: runtime.account_id,
        entity_type,
        entity_id,
        proposed_revision,
        key_id: runtime.key_id as u64,
        deleted_flag: 0,
        schema_version: SCHEMA_VERSION,
        encryption_device_id: runtime.encryption_device_id,
    });
    let envelope = CipherEnvelope::new(
        runtime.key_id,
        runtime.encryption_device_id,
        counter,
        runtime
            .vault
            .encrypt_with_dek(
                dek_handle,
                &nonce(runtime.encryption_device_id, counter),
                &aad,
                &plaintext,
            )
            .map_err(crypto_error)?,
    )
    .map_err(crypto_error)?;

    Ok(serialize_envelope(&envelope))
}

#[cfg(feature = "crypto")]
fn crypto_wrap_dek_for_devices_inner(
    label: &str,
    state: &CryptoCommandState,
    dek_handle: u32,
    device_pubs: Vec<DevicePublicInput>,
) -> AppResult<Vec<DeviceDekWrapEnvelope>> {
    ensure_crypto_window_allowed(label)?;
    let runtime = state.runtime.lock().map_err(lock_error)?;
    let dek_handle = KeyHandleId::from_raw(dek_handle).map_err(crypto_error)?;

    device_pubs
        .into_iter()
        .map(|device| {
            let target_device_id = bytes_16("targetDeviceId", device.target_device_id)?;
            let device_pub = bytes_32("devicePub", device.device_pub)?;
            let info = encode_wrap_aad(&WrapAad {
                account_id: runtime.account_id,
                target_device_id,
                key_id: runtime.key_id as u64,
                granted_by_device_id: runtime.granted_by_device_id,
            });
            let wrap = seal_dek_for_device(
                &runtime.vault,
                dek_handle,
                device_pub,
                &info,
                WRAP_AAD_CONTEXT,
            )
            .map_err(crypto_error)?;
            Ok(DeviceDekWrapEnvelope {
                target_device_id: target_device_id.to_vec(),
                encapped_key: wrap.encapped_key.to_vec(),
                ciphertext: wrap.ciphertext,
            })
        })
        .collect()
}

#[cfg(feature = "crypto")]
fn crypto_unwrap_dek_for_device_inner(
    label: &str,
    state: &CryptoCommandState,
    wrap_envelope: DeviceDekWrapEnvelope,
) -> AppResult<u32> {
    ensure_crypto_window_allowed(label)?;
    let mut runtime = state.runtime.lock().map_err(lock_error)?;
    let device_priv_handle = runtime
        .active_device_priv_handle
        .ok_or(AppError::SyncCryptoNotInitialized)?;
    let target_device_id = bytes_16("targetDeviceId", wrap_envelope.target_device_id)?;
    let encapped_key = bytes_32("encappedKey", wrap_envelope.encapped_key)?;
    let info = encode_wrap_aad(&WrapAad {
        account_id: runtime.account_id,
        target_device_id,
        key_id: runtime.key_id as u64,
        granted_by_device_id: runtime.granted_by_device_id,
    });
    let handle = open_dek_wrap_into_vault(
        &mut runtime.vault,
        device_priv_handle,
        &DeviceDekWrap {
            encapped_key,
            ciphertext: wrap_envelope.ciphertext,
        },
        &info,
        WRAP_AAD_CONTEXT,
    )
    .map_err(crypto_error)?;
    Ok(handle.get())
}

#[cfg(feature = "crypto")]
fn crypto_recovery_sign_inner(
    label: &str,
    state: &CryptoCommandState,
    challenge: Vec<u8>,
    new_payload_hash: Vec<u8>,
) -> AppResult<RecoverySignatureOutput> {
    ensure_crypto_window_allowed(label)?;
    let runtime = state.runtime.lock().map_err(lock_error)?;
    let dek_handle = runtime
        .active_dek_handle
        .ok_or(AppError::SyncCryptoNotInitialized)?;
    let transcript = RecoveryMessageAad {
        challenge_id: bytes_16("challenge", challenge)?,
        account_id: runtime.account_id,
        payload_canonical_hash: bytes_32("newPayloadHash", new_payload_hash)?,
        ts_ms: now_ms()?,
    };
    let proof =
        sign_recovery_transcript(&runtime.vault, dek_handle, &transcript).map_err(crypto_error)?;

    Ok(RecoverySignatureOutput {
        recovery_signing_pub: proof.recovery_signing_pub.to_vec(),
        signature: proof.signature.to_vec(),
        transcript_cbor: encode_recovery_message_aad(&transcript),
    })
}

#[cfg(feature = "crypto")]
fn nonce(encryption_device_id: u64, counter: u32) -> [u8; 12] {
    let mut out = [0u8; 12];
    out[..8].copy_from_slice(&encryption_device_id.to_le_bytes());
    out[8..].copy_from_slice(&counter.to_le_bytes());
    out
}

#[cfg(feature = "crypto")]
fn bytes_16(name: &str, value: Vec<u8>) -> AppResult<[u8; 16]> {
    value.try_into().map_err(|value: Vec<u8>| {
        AppError::SyncInvalidInput(format!("{name} must be 16 bytes, got {}", value.len()))
    })
}

#[cfg(feature = "crypto")]
fn bytes_32(name: &str, value: Vec<u8>) -> AppResult<[u8; 32]> {
    value.try_into().map_err(|value: Vec<u8>| {
        AppError::SyncInvalidInput(format!("{name} must be 32 bytes, got {}", value.len()))
    })
}

#[cfg(feature = "crypto")]
fn now_ms() -> AppResult<u64> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| AppError::SyncCrypto(format!("system clock before unix epoch: {error}")))
        .map(|duration| duration.as_millis() as u64)
}

#[cfg(feature = "crypto")]
fn lock_error<T>(error: std::sync::PoisonError<T>) -> AppError {
    AppError::SyncCrypto(format!("crypto state lock poisoned: {error}"))
}

#[cfg(feature = "crypto")]
fn crypto_error(error: impl std::fmt::Display) -> AppError {
    AppError::SyncCrypto(error.to_string())
}

#[cfg(all(test, feature = "crypto"))]
mod tests {
    use super::*;
    use crate::crypto::{
        aad::{encode_blob_aad, BlobAad},
        device_key::import_device_private_into_vault,
        envelope::parse_envelope,
        key_vault::KEY_BYTES,
        recovery_signing::verify_recovery_signature_strict,
    };

    fn state_with_keys() -> (CryptoCommandState, u32, [u8; 32], [u8; 16]) {
        let state = CryptoCommandState::default();
        let mut runtime = state.runtime.lock().unwrap();
        runtime.account_id = [0x10; 16];
        runtime.encryption_device_id = 0x0102_0304_0506_0708;
        runtime.granted_by_device_id = [0x20; 16];
        runtime.key_id = 7;
        let device =
            import_device_private_into_vault(&mut runtime.vault, [0x33; KEY_BYTES]).unwrap();
        let dek_handle = runtime.vault.insert_dek([0x55; KEY_BYTES]).unwrap();
        runtime.active_dek_handle = Some(dek_handle);
        runtime.active_device_priv_handle = Some(device.device_priv_handle);
        drop(runtime);
        (state, dek_handle.get(), device.device_pub, [0x44; 16])
    }

    #[test]
    fn rejects_non_allowlisted_window() {
        let (state, _, _, _) = state_with_keys();
        let err = crypto_encrypt_for_inner(
            "main",
            &state,
            "todos".into(),
            "todo-1".into(),
            1,
            b"secret".to_vec(),
        )
        .unwrap_err();
        assert!(err.to_string().starts_with("E3004:"));
    }

    #[test]
    fn encrypt_for_builds_blob_aad_inside_rust() {
        let (state, dek_handle, _, _) = state_with_keys();
        let bytes = crypto_encrypt_for_inner(
            "account",
            &state,
            "todos".into(),
            "todo-1".into(),
            9,
            b"secret".to_vec(),
        )
        .unwrap();
        let envelope = parse_envelope(&bytes).unwrap();
        let runtime = state.runtime.lock().unwrap();
        let aad = encode_blob_aad(&BlobAad {
            account_id: runtime.account_id,
            entity_type: "todos".into(),
            entity_id: "todo-1".into(),
            proposed_revision: 9,
            key_id: 7,
            deleted_flag: 0,
            schema_version: SCHEMA_VERSION,
            encryption_device_id: runtime.encryption_device_id,
        });
        let plaintext = runtime
            .vault
            .decrypt_with_dek(
                KeyHandleId::from_raw(dek_handle).unwrap(),
                &envelope.nonce(),
                &aad,
                &envelope.sealed(),
            )
            .unwrap();
        assert_eq!(plaintext, b"secret");
    }

    #[test]
    fn wrap_and_unwrap_dek_use_opaque_handles() {
        let (state, dek_handle, device_pub, target_device_id) = state_with_keys();
        let wraps = crypto_wrap_dek_for_devices_inner(
            "account",
            &state,
            dek_handle,
            vec![DevicePublicInput {
                target_device_id: target_device_id.to_vec(),
                device_pub: device_pub.to_vec(),
            }],
        )
        .unwrap();
        assert_eq!(wraps.len(), 1);
        let recovered = crypto_unwrap_dek_for_device_inner(
            "account",
            &state,
            wraps.into_iter().next().unwrap(),
        )
        .unwrap();
        assert_ne!(recovered, 0);
    }

    #[test]
    fn recovery_sign_returns_strictly_verifiable_transcript() {
        let (state, _, _, _) = state_with_keys();
        let output =
            crypto_recovery_sign_inner("control", &state, [0x66; 16].to_vec(), [0x77; 32].to_vec())
                .unwrap();
        verify_recovery_signature_strict(
            output.recovery_signing_pub.try_into().unwrap(),
            &output.transcript_cbor,
            output.signature.try_into().unwrap(),
        )
        .unwrap();
    }
}
