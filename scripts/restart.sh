#!/bin/bash
echo "🧹 清理 Rust 缓存..."
cd apps/desktop/src-tauri && cargo clean && cd ../../..

echo "🚀 启动 Tauri 开发服务器..."
cd apps/desktop && pnpm tauri dev
