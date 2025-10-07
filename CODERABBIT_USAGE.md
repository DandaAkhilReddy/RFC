# CodeRabbit CLI Quick Reference Guide

## 🚀 Quick Start

### First Time Setup - Authentication Required

**Important:** You must authenticate before first use!

```bash
# Open WSL
wsl

# Run OAuth login
coderabbit auth login
```

This will open a browser for authentication. Follow the prompts to log in.

## 📝 Usage Commands

### From Windows PowerShell

```powershell
# Quick review (plain text output)
.\scripts\coderabbit-review.ps1

# Review with different types
.\scripts\coderabbit-review.ps1 -ReviewType uncommitted -Mode plain
.\scripts\coderabbit-review.ps1 -ReviewType all -Mode prompt-only

# Available ReviewTypes: uncommitted, committed, all
# Available Modes: plain, prompt-only, interactive
```

### From WSL

```bash
# Quick review
bash /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-review.sh

# Review specific type
bash /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-review.sh uncommitted --plain

# Claude Code integration
bash /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-claude-integration.sh
```

### Direct CodeRabbit Commands (in WSL)

```bash
# Navigate to project
cd /mnt/c/users/akhil/ReddyfitWebsiteready

# Review uncommitted changes
coderabbit review --plain --type uncommitted

# Review all changes since base branch
coderabbit review --plain --type all --base main

# Get token-efficient output for AI agents
coderabbit review --prompt-only --type uncommitted

# Check authentication
coderabbit auth status

# View version
coderabbit --version
```

## 🔄 CodeRabbit + Claude Code Workflow

### Automated Generate-Review-Fix Loop

1. **Let Claude Code write code** (your normal workflow)
2. **Run CodeRabbit review**:
   ```powershell
   .\scripts\coderabbit-review.ps1 -Mode prompt-only
   ```
3. **Feed issues to Claude Code**:
   - Copy the output from step 2
   - Paste into Claude Code: "Fix these CodeRabbit issues: [paste output]"
4. **Let Claude Code fix automatically**
5. **Repeat** until CodeRabbit reports clean

### Using the Integration Script

```bash
# Run automated integration workflow
wsl bash /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-claude-integration.sh
```

This script:
- Runs CodeRabbit review
- Formats output for Claude Code
- Provides copy-paste prompt
- Saves review to temp file

## 🎯 Common Workflows

### Before Committing

```powershell
# Review your changes
.\scripts\coderabbit-review.ps1

# Fix any issues (manually or with Claude Code)

# Review again to verify
.\scripts\coderabbit-review.ps1

# Commit when clean
git add .
git commit -m "Your message"
```

### Reviewing Specific Features

```bash
cd /mnt/c/users/akhil/ReddyfitWebsiteready

# Review only uncommitted changes
coderabbit review --plain --type uncommitted

# Review all changes from a specific commit
coderabbit review --plain --base-commit abc1234

# Review compared to main branch
coderabbit review --plain --base main
```

### For Pull Requests

```bash
# GitHub Actions will automatically run CodeRabbit
# on every PR to main branch

# Manual PR review (locally)
git checkout feature-branch
coderabbit review --plain --base main
```

## 📊 Review Output Modes

### `--plain` (Detailed Feedback)

- Comprehensive analysis
- Fix suggestions
- Code snippets
- Severity levels
- Best for manual review

### `--prompt-only` (Token Efficient)

- Minimal, focused output
- Optimized for AI agents
- Just the essential issues
- Best for Claude Code integration

### Interactive (Default)

- Rich terminal UI
- Color-coded output
- Interactive navigation
- Best for exploratory review

## 🔧 Configuration

### Project Config: `.coderabbit.yaml`

Located at: `C:\users\akhil\ReddyfitWebsiteready\.coderabbit.yaml`

Customize review preferences:
- Review profile (chill, assertive, pythonic)
- Enabled tools (ESLint, Biome, etc.)
- Project-specific instructions
- Auto-review settings

### Ignore Files: `.coderabbitignore`

Located at: `C:\users\akhil\ReddyfitWebsiteready\.coderabbitignore`

Excludes files from review:
- `node_modules/`
- `dist/`
- `*.min.js`
- Generated files

## 🔑 Authentication

### Check Auth Status

```bash
wsl -e coderabbit auth status
```

### Re-authenticate

```bash
wsl -e coderabbit auth login
```

### Environment Variable

API key is automatically set in `~/.bashrc`:
```bash
export CODERABBIT_API_KEY="cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade"
```

## 🤖 GitHub Actions Integration

CodeRabbit automatically runs on:
- All pull requests to `main`
- Every push to `main`

Workflow file: `.github/workflows/coderabbit-review.yml`

### Adding API Key to GitHub

1. Go to: https://github.com/DandaAkhilReddy/RFC/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CODERABBIT_API_KEY`
4. Value: `cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade`
5. Click "Add secret"

## 💡 Tips & Best Practices

### Before Each Commit

Always review before committing:
```powershell
.\scripts\coderabbit-review.ps1
```

### Integration with Git Hooks

Add to `.git/hooks/pre-commit` (optional):
```bash
#!/bin/bash
bash /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-review.sh uncommitted --plain
```

### For Large Changes

Review incrementally:
```bash
# Review service layer
cd /mnt/c/users/akhil/ReddyfitWebsiteready
git add src/lib/pointsService.ts
coderabbit review --plain --type uncommitted

# Review components
git add src/components/FriendsPage.tsx
coderabbit review --plain --type uncommitted
```

### With Claude Code

Generate-review-iterate:
1. Claude generates code
2. `.\scripts\coderabbit-review.ps1 -Mode prompt-only`
3. Paste output to Claude: "Fix these issues"
4. Repeat until clean

## 🆘 Troubleshooting

### "Authentication required"

```bash
wsl -e coderabbit auth login
```

### "Command not found"

```bash
# Reinstall
wsl bash /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/install-coderabbit-wsl.sh
```

### Scripts don't run

```bash
# Make executable
wsl bash -c "chmod +x /mnt/c/users/akhil/ReddyfitWebsiteready/scripts/*.sh"
```

### Review fails

Check:
1. Are you in a git repository?
2. Are there uncommitted changes to review?
3. Is the API key set correctly?

```bash
# Check API key
wsl bash -c "echo \$CODERABBIT_API_KEY"

# Should output: cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade
```

## 📚 Resources

- **CodeRabbit Docs**: https://www.coderabbit.ai/cli
- **ReddyFit Setup Guide**: `CODERABBIT_SETUP.md`
- **Configuration Reference**: `.coderabbit.yaml`
- **GitHub Repo**: https://github.com/DandaAkhilReddy/RFC

## 📂 File Locations

- **PowerShell Script**: `C:\users\akhil\ReddyfitWebsiteready\scripts\coderabbit-review.ps1`
- **WSL Review Script**: `/mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-review.sh`
- **Claude Integration**: `/mnt/c/users/akhil/ReddyfitWebsiteready/scripts/coderabbit-claude-integration.sh`
- **Installation Script**: `/mnt/c/users/akhil/ReddyfitWebsiteready/scripts/install-coderabbit-wsl.sh`

---

**Last Updated**: 2025-10-07
**CodeRabbit Version**: 0.3.3
**WSL Distribution**: Ubuntu 24.04
