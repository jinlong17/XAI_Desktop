#!/bin/bash

echo "🧹 完全清理和重启脚本"
echo "================================"
echo ""

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="/Users/jinlong/Desktop/jinlong_project/XAI_Desktop"

echo "📍 项目路径: $PROJECT_ROOT"
echo ""

# 步骤 1: 清理 Rust 缓存
echo "${YELLOW}步骤 1/3: 清理 Rust 编译缓存...${NC}"
cd "$PROJECT_ROOT/apps/desktop/src-tauri"
if cargo clean; then
    echo "${GREEN}✅ Rust 缓存已清理${NC}"
else
    echo "⚠️  cargo clean 失败，继续..."
fi
echo ""

# 步骤 2: 删除 target 目录（确保完全清理）
echo "${YELLOW}步骤 2/3: 删除 target 目录...${NC}"
rm -rf "$PROJECT_ROOT/apps/desktop/src-tauri/target"
echo "${GREEN}✅ target 目录已删除${NC}"
echo ""

# 步骤 3: 提示用户清理 localStorage
echo "${YELLOW}步骤 3/3: 需要手动清理 localStorage${NC}"
echo ""
echo "⚠️  重要: 启动应用后，在开发工具控制台运行:"
echo "   localStorage.clear(); location.reload();"
echo ""
echo "或者删除所有旧的 Box，只测试新创建的。"
echo ""

# 返回到 desktop 目录
cd "$PROJECT_ROOT/apps/desktop"

echo "================================"
echo "${GREEN}✅ 清理完成！${NC}"
echo ""
echo "现在运行: pnpm tauri dev"
echo ""
echo "注意:"
echo "1. 编译需要几分钟（因为清理了缓存）"
echo "2. 启动后清理 localStorage"
echo "3. 参考 COMPLETE_RESET_AND_VERIFY.md 进行验证"
echo ""

