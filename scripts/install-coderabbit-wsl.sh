#!/bin/bash
# CodeRabbit CLI Installation Script for WSL
# One-command installation for ReddyFit project

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🤖 CodeRabbit CLI Installation for WSL${NC}"
echo ""

# Step 1: Check and install unzip if needed
echo -e "${BLUE}📦 Step 1: Checking dependencies...${NC}"
if ! command -v unzip &> /dev/null; then
    echo -e "${YELLOW}Installing unzip...${NC}"
    sudo apt-get update -qq
    sudo apt-get install -y unzip
    echo -e "${GREEN}✓ unzip installed${NC}"
else
    echo -e "${GREEN}✓ unzip already installed${NC}"
fi

# Step 2: Install CodeRabbit CLI
echo ""
echo -e "${BLUE}📥 Step 2: Installing CodeRabbit CLI...${NC}"
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Step 3: Configure environment
echo ""
echo -e "${BLUE}⚙️  Step 3: Configuring environment...${NC}"

# Add to bashrc if not already present
if ! grep -q "CODERABBIT_API_KEY" ~/.bashrc; then
    echo 'export CODERABBIT_API_KEY="cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade"' >> ~/.bashrc
    echo -e "${GREEN}✓ API key added to ~/.bashrc${NC}"
else
    echo -e "${GREEN}✓ API key already configured${NC}"
fi

# Reload bashrc
source ~/.bashrc

# Make automation scripts executable
echo ""
echo -e "${BLUE}🔧 Step 4: Setting up automation scripts...${NC}"
chmod +x /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/*.sh
echo -e "${GREEN}✓ Scripts made executable${NC}"

# Step 5: Authenticate
echo ""
echo -e "${BLUE}🔑 Step 5: Authentication required${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}To complete setup, please run:${NC}"
echo ""
echo -e "  ${GREEN}coderabbit auth login${NC}"
echo ""
echo -e "${YELLOW}This will open a browser for OAuth authentication.${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Summary
echo -e "${GREEN}✅ CodeRabbit CLI installation complete!${NC}"
echo ""
echo -e "${BLUE}📚 Available commands:${NC}"
echo "  coderabbit --version                    # Check version"
echo "  coderabbit auth login                   # Authenticate"
echo "  coderabbit auth status                  # Check auth status"
echo "  coderabbit review --plain               # Review code"
echo ""
echo -e "${BLUE}📂 Automation scripts:${NC}"
echo "  bash ~/scripts/coderabbit-review.sh     # Quick review"
echo "  bash ~/scripts/coderabbit-claude-integration.sh  # Claude integration"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to authenticate before first use!${NC}"
