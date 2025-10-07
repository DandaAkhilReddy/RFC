#!/bin/bash
# CodeRabbit + Claude Code Integration Script
# Automated generate-review-fix workflow

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🤖 CodeRabbit + Claude Code Integration${NC}"
echo -e "${BLUE}🔄 Automated Code Review & Fix Workflow${NC}"
echo ""

# Set working directory
PROJECT_DIR="/mnt/c/users/akhil/ReddyfitWebsiteready"
cd "$PROJECT_DIR"

# Load environment
source ~/.bashrc

# Check authentication
if ! coderabbit auth status 2>&1 | grep -q "Logged in"; then
    echo -e "${RED}❌ Not authenticated. Run: coderabbit auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✓ CodeRabbit authenticated${NC}"
echo ""

# Step 1: Run CodeRabbit review with prompt-only mode
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Step 1: Running CodeRabbit Review${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run review and capture output
REVIEW_OUTPUT=$(coderabbit review --prompt-only --type uncommitted --no-color 2>&1)
REVIEW_EXIT_CODE=$?

if [ $REVIEW_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ CodeRabbit review failed${NC}"
    echo "$REVIEW_OUTPUT"
    exit 1
fi

# Check if there are any issues
if echo "$REVIEW_OUTPUT" | grep -q "No issues found" || [ -z "$REVIEW_OUTPUT" ]; then
    echo -e "${GREEN}✅ No issues found! Code looks clean.${NC}"
    exit 0
fi

echo -e "${YELLOW}⚠️  Issues found. Output:${NC}"
echo ""
echo "$REVIEW_OUTPUT"
echo ""

# Step 2: Save review output to temp file
TEMP_FILE="/tmp/coderabbit-review-$(date +%s).txt"
echo "$REVIEW_OUTPUT" > "$TEMP_FILE"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💡 Step 2: Prompt for Claude Code${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Copy the following prompt to Claude Code:${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "CodeRabbit found the following issues in the code:"
echo ""
echo "$REVIEW_OUTPUT"
echo ""
echo "Please fix all these issues in the codebase."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Review output saved to: $TEMP_FILE${NC}"
echo ""
echo -e "${GREEN}✅ Integration complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Copy the prompt above to Claude Code"
echo "2. Let Claude Code fix the issues automatically"
echo "3. Run this script again to verify fixes"
echo "4. Repeat until clean (generate-review-fix loop)"
