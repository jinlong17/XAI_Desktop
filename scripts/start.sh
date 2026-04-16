#!/bin/bash

# =============================================================================
# XAI Desktop Startup Script
# =============================================================================
# Usage:
#   ./scripts/start.sh          # Start desktop app in dev mode
#   ./scripts/start.sh dev      # Start desktop app in dev mode
#   ./scripts/start.sh build    # Build desktop app for production
#   ./scripts/start.sh web      # Start web app in dev mode
#   ./scripts/start.sh docs     # Start docs app in dev mode
#   ./scripts/start.sh all      # Start all apps in dev mode
#   ./scripts/start.sh install  # Install dependencies only
#   ./scripts/start.sh clean    # Clean all caches and reinstall
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "${BLUE}=============================================${NC}"
    echo -e "${BLUE}  XAI Desktop - $1${NC}"
    echo -e "${BLUE}=============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# =============================================================================
# Environment Setup
# =============================================================================

setup_conda() {
    print_info "Setting up conda environment..."
    
    # Try to source conda
    if [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
        source "$HOME/anaconda3/etc/profile.d/conda.sh"
    elif [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
        source "$HOME/miniconda3/etc/profile.d/conda.sh"
    elif [ -f "/opt/homebrew/Caskroom/miniconda/base/etc/profile.d/conda.sh" ]; then
        source "/opt/homebrew/Caskroom/miniconda/base/etc/profile.d/conda.sh"
    else
        print_warning "Conda not found, using system Node.js"
        return 0
    fi
    
    # Check if ai-desktop environment exists
    if conda env list | grep -q "ai-desktop"; then
        conda activate ai-desktop
        print_success "Activated conda environment: ai-desktop"
    else
        print_warning "Conda environment 'ai-desktop' not found"
        print_info "Creating environment... Run: conda create -n ai-desktop nodejs=20 -c conda-forge -y"
        return 1
    fi
}

check_requirements() {
    print_info "Checking requirements..."
    
    local all_ok=true
    
    # Check Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version | sed 's/v//')
        local node_major=$(echo $node_version | cut -d. -f1)
        if [ "$node_major" -ge 18 ]; then
            print_success "Node.js: v$node_version"
        else
            print_error "Node.js version must be >= 18 (found: v$node_version)"
            all_ok=false
        fi
    else
        print_error "Node.js not found"
        all_ok=false
    fi
    
    # Check pnpm
    if command -v pnpm &> /dev/null; then
        print_success "pnpm: $(pnpm --version)"
    else
        print_warning "pnpm not found, installing..."
        npm install -g pnpm@9
    fi
    
    # Check Rust
    if command -v rustc &> /dev/null; then
        print_success "Rust: $(rustc --version | awk '{print $2}')"
    else
        print_error "Rust not found. Install from: https://rustup.rs/"
        all_ok=false
    fi
    
    # Check Tauri CLI
    if command -v cargo &> /dev/null && cargo tauri --version &> /dev/null; then
        print_success "Tauri CLI: $(cargo tauri --version)"
    else
        print_warning "Tauri CLI not found, installing..."
        cargo install tauri-cli
    fi
    
    if [ "$all_ok" = false ]; then
        print_error "Some requirements are missing. Please install them first."
        exit 1
    fi
}

install_dependencies() {
    print_info "Installing dependencies..."
    
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        pnpm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already up to date"
    fi
}

# =============================================================================
# Main Commands
# =============================================================================

cmd_dev() {
    print_header "Development Mode - Desktop"
    setup_conda
    check_requirements
    install_dependencies
    
    print_info "Starting Tauri development server..."
    cd apps/desktop
    pnpm tauri dev
}

cmd_build() {
    print_header "Production Build - Desktop"
    setup_conda
    check_requirements
    install_dependencies
    
    print_info "Building Tauri application..."
    cd apps/desktop
    pnpm tauri build
    
    print_success "Build complete!"
    print_info "Output: apps/desktop/src-tauri/target/release/bundle/"
}

cmd_web() {
    print_header "Development Mode - Web"
    setup_conda
    check_requirements
    install_dependencies
    
    print_info "Starting web development server..."
    pnpm turbo dev --filter=web
}

cmd_docs() {
    print_header "Development Mode - Docs"
    setup_conda
    check_requirements
    install_dependencies
    
    print_info "Starting docs development server..."
    pnpm turbo dev --filter=docs
}

cmd_all() {
    print_header "Development Mode - All Apps"
    setup_conda
    check_requirements
    install_dependencies
    
    print_info "Starting all development servers..."
    pnpm dev
}

cmd_install() {
    print_header "Install Dependencies"
    setup_conda
    check_requirements
    install_dependencies
    print_success "All dependencies installed!"
}

cmd_clean() {
    print_header "Clean and Reinstall"
    setup_conda
    
    print_info "Cleaning node_modules..."
    rm -rf node_modules
    rm -rf apps/*/node_modules
    rm -rf packages/*/node_modules
    
    print_info "Cleaning Rust cache..."
    cd apps/desktop/src-tauri && cargo clean && cd ../../..
    
    print_info "Cleaning turbo cache..."
    rm -rf .turbo
    
    print_info "Reinstalling dependencies..."
    pnpm install
    
    print_success "Clean complete!"
}

cmd_help() {
    echo "XAI Desktop Startup Script"
    echo ""
    echo "Usage: ./scripts/start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev, (default)  Start desktop app in development mode"
    echo "  build           Build desktop app for production"
    echo "  web             Start web app in development mode"
    echo "  docs            Start docs app in development mode"
    echo "  all             Start all apps in development mode"
    echo "  install         Install dependencies only"
    echo "  clean           Clean all caches and reinstall"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/start.sh          # Start desktop dev server"
    echo "  ./scripts/start.sh build    # Build for production"
    echo "  ./scripts/start.sh clean    # Clean and reinstall"
}

# =============================================================================
# Main Entry Point
# =============================================================================

case "${1:-dev}" in
    dev)
        cmd_dev
        ;;
    build)
        cmd_build
        ;;
    web)
        cmd_web
        ;;
    docs)
        cmd_docs
        ;;
    all)
        cmd_all
        ;;
    install)
        cmd_install
        ;;
    clean)
        cmd_clean
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        print_error "Unknown command: $1"
        cmd_help
        exit 1
        ;;
esac
