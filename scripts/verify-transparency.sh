#!/bin/bash

echo "🔍 Verifying Transparency Configuration..."
echo ""

# Check Cargo.toml
if grep -q 'features = \["macos-private-api"\]' apps/desktop/src-tauri/Cargo.toml; then
    echo "✅ macos-private-api feature enabled in Cargo.toml"
else
    echo "❌ macos-private-api feature NOT found in Cargo.toml"
fi

# Check tauri.conf.json
if grep -q '"transparent": true' apps/desktop/src-tauri/tauri.conf.json; then
    echo "✅ Window transparency enabled in tauri.conf.json"
else
    echo "❌ Window transparency NOT enabled"
fi

if grep -q '"macOSPrivateApi": true' apps/desktop/src-tauri/tauri.conf.json; then
    echo "✅ macOSPrivateApi enabled in tauri.conf.json"
else
    echo "⚠️  macOSPrivateApi not found in tauri.conf.json"
fi

# Check lib.rs
if grep -q 'NSColor::clearColor' apps/desktop/src-tauri/src/lib.rs; then
    echo "✅ NSColor::clearColor configured in lib.rs"
else
    echo "❌ NSColor::clearColor NOT found in lib.rs"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuration complete! Next steps:"
echo "   1. cd apps/desktop"
echo "   2. pnpm tauri clean"
echo "   3. pnpm tauri dev"
echo "   4. Verify you can see desktop wallpaper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

