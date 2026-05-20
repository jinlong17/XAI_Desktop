# Proposed Contract Changes: Export/Import

## UI Ownership

Track D added plugin-side encrypted JSON bundle helpers. Track E or account settings should own UI placement.

Required host contract:

- User chooses passphrase.
- Host/plugin-account supplies all entity adapters.
- Import confirms destructive merge policy before writing records.
