#!/bin/bash
# CodeRabbit Review Script for ReddyFit
# Quick review script for current changes in WSL

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 CodeRabbit Review - ReddyFit Social Competition System${NC}"
echo ""

# Set working directory to ReddyFit project
PROJECT_DIR="/mnt/c/users/akhil/ReddyfitWebsiteready"
cd "$PROJECT_DIR"

# Load environment variables
source ~/.bashrc

# Check authentication
echo -e "${YELLOW}🔍 Checking authentication status...${NC}"
if ! coderabbit auth status 2>&1 | grep -q "Logged in"; then
    echo -e "${RED}❌ Not authenticated. Please run: wsl bash -c 'coderabbit auth login'${NC}"
    exit 1
fi

# Determine review type
REVIEW_TYPE="${1:-uncommitted}"  # Default to uncommitted changes
REVIEW_MODE="${2:---plain}"      # Default to plain mode

echo -e "${GREEN}✓ Authenticated${NC}"
echo -e "${BLUE}📊 Running CodeRabbit review (type: $REVIEW_TYPE, mode: $REVIEW_MODE)...${NC}"
echo ""

# Run CodeRabbit review
if [ "$REVIEW_MODE" == "--prompt-only" ]; then
    # Minimal output for Claude Code integration
    coderabbit review --prompt-only --type "$REVIEW_TYPE" --no-color
elif [ "$REVIEW_MODE" == "--plain" ]; then
    # Detailed feedback
    coderabbit review --plain --type "$REVIEW_TYPE"
else
    # Interactive mode (default)
    coderabbit review --type "$REVIEW_TYPE"
fi

echo ""
echo -e "${GREEN}✅ CodeRabbit review complete!${NC}"
