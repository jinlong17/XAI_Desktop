#![allow(dead_code)]

use std::path::Path;

use rusqlite::{Connection, OpenFlags};
use zeroize::{Zeroize, Zeroizing};

use super::{
    kdf::{derive_db_key, KdfError, KEY_BYTES},
    key_vault::{KeyHandleId, KeyVault, KeyVaultError},
};

pub const SQLCIPHER_COMPATIBILITY: u8 = 4;

pub struct SqlCipherDb {
    conn: Connection,
}

impl SqlCipherDb {
    pub fn open_with_kek(
        vault: &KeyVault,
        kek_handle: KeyHandleId,
        path: impl AsRef<Path>,
    ) -> SqlCipherResult<Self> {
        let mut db_key = Zeroizing::new(vault.with_kek(kek_handle, derive_db_key)??);
        let conn = Connection::open_with_flags(
            path,
            OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE,
        )?;
        apply_sqlcipher_key(&conn, &db_key)?;
        db_key.zeroize();
        Ok(Self { conn })
    }

    pub fn connection(&self) -> &Connection {
        &self.conn
    }

    pub fn close(self) -> SqlCipherResult<()> {
        self.conn
            .close()
            .map_err(|(_, error)| SqlCipherError::Sqlite(error.to_string()))
    }
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum SqlCipherError {
    #[error("E3020: sqlcipher init failed: invalid db key length {0}")]
    InvalidDbKeyLength(usize),

    #[error("E3020: sqlcipher init failed: malformed hex key")]
    MalformedHexKey,

    #[error("E3020: sqlcipher init failed: {0}")]
    Sqlite(String),

    #[error("key vault error: {0}")]
    KeyVault(String),

    #[error("KDF error: {0}")]
    Kdf(String),
}

impl From<rusqlite::Error> for SqlCipherError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value.to_string())
    }
}

impl From<KeyVaultError> for SqlCipherError {
    fn from(value: KeyVaultError) -> Self {
        Self::KeyVault(value.to_string())
    }
}

impl From<KdfError> for SqlCipherError {
    fn from(value: KdfError) -> Self {
        Self::Kdf(value.to_string())
    }
}

pub type SqlCipherResult<T> = Result<T, SqlCipherError>;

pub fn apply_sqlcipher_key(conn: &Connection, db_key: &[u8; KEY_BYTES]) -> SqlCipherResult<()> {
    conn.execute_batch(&raw_key_pragma(db_key)?)?;
    conn.execute_batch(&format!(
        "PRAGMA cipher_compatibility = {SQLCIPHER_COMPATIBILITY};"
    ))?;
    validate_sqlcipher_connection(conn)?;
    Ok(())
}

pub fn raw_key_pragma(db_key: &[u8]) -> SqlCipherResult<String> {
    if db_key.len() != KEY_BYTES {
        return Err(SqlCipherError::InvalidDbKeyLength(db_key.len()));
    }
    let hex = strict_hex_32(db_key)?;
    Ok(format!("PRAGMA key = \"x'{hex}'\";"))
}

fn validate_sqlcipher_connection(conn: &Connection) -> SqlCipherResult<()> {
    conn.query_row("SELECT count(*) FROM sqlite_master;", [], |_row| Ok(()))
        .map_err(SqlCipherError::from)
}

fn strict_hex_32(bytes: &[u8]) -> SqlCipherResult<String> {
    if bytes.len() != KEY_BYTES {
        return Err(SqlCipherError::InvalidDbKeyLength(bytes.len()));
    }

    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(KEY_BYTES * 2);
    for byte in bytes {
        out.push(HEX[(byte >> 4) as usize] as char);
        out.push(HEX[(byte & 0x0f) as usize] as char);
    }
    if out.len() != KEY_BYTES * 2 || !out.as_bytes().iter().all(u8::is_ascii_hexdigit) {
        return Err(SqlCipherError::MalformedHexKey);
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use std::{
        fs,
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };

    use super::*;

    fn temp_db_path(name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!("xai-{name}-{}-{nanos}.db", std::process::id()))
    }

    #[test]
    fn raw_key_pragma_accepts_only_32_bytes_and_hex_encodes_internally() {
        let pragma = raw_key_pragma(&[0xabu8; KEY_BYTES]).unwrap();
        assert_eq!(
            pragma,
            "PRAGMA key = \"x'abababababababababababababababababababababababababababababababab'\";"
        );
        assert_eq!(
            raw_key_pragma(&[0u8; KEY_BYTES - 1]),
            Err(SqlCipherError::InvalidDbKeyLength(KEY_BYTES - 1))
        );
    }

    #[test]
    fn db_opens_with_correct_kek_and_fails_with_wrong_kek() {
        let path = temp_db_path("sqlcipher-roundtrip");
        let mut vault = KeyVault::new();
        let good_kek = vault.insert_kek([0x11; KEY_BYTES]).unwrap();
        let wrong_kek = vault.insert_kek([0x12; KEY_BYTES]).unwrap();

        {
            let db = SqlCipherDb::open_with_kek(&vault, good_kek, &path).unwrap();
            db.connection()
                .execute_batch(
                    "CREATE TABLE secrets (id INTEGER PRIMARY KEY, value TEXT NOT NULL);
                     INSERT INTO secrets(value) VALUES ('encrypted');",
                )
                .unwrap();
            db.close().unwrap();
        }

        {
            let db = SqlCipherDb::open_with_kek(&vault, good_kek, &path).unwrap();
            let value: String = db
                .connection()
                .query_row("SELECT value FROM secrets WHERE id = 1;", [], |row| row.get(0))
                .unwrap();
            assert_eq!(value, "encrypted");
            db.close().unwrap();
        }

        assert!(SqlCipherDb::open_with_kek(&vault, wrong_kek, &path).is_err());
        let _ = fs::remove_file(path);
    }
}

