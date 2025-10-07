# CodeRabbit AI Integration Guide

## 🤖 Overview
This project uses CodeRabbit AI for automated code reviews of the ReddyFit social fitness platform.

## 📦 Installation

### Windows (via WSL)
```bash
# Open WSL terminal
wsl

# Install CodeRabbit CLI
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Verify installation
coderabbit --version
```

## 🔑 Authentication

### Set API Key (in WSL)
```bash
# Temporary (current session only)
export CODERABBIT_API_KEY="cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade"

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export CODERABBIT_API_KEY="cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade"' >> ~/.bashrc
source ~/.bashrc
```

### Verify Authentication
```bash
coderabbit auth status
```

## 🎯 Usage

### Basic Code Review
```bash
cd /mnt/c/users/akhil/ReddyfitWebsiteready

# Review all uncommitted changes
coderabbit review

# Review with plain output
coderabbit review --plain
```

### Review Specific Files

#### Social Competition System
```bash
# Review points service
coderabbit review src/lib/pointsService.ts

# Review friends service
coderabbit review src/lib/friendsService.ts

# Review leaderboard service
coderabbit review src/lib/leaderboardService.ts
```

#### UI Components
```bash
# Review FriendsPage
coderabbit review src/components/FriendsPage.tsx

# Review Leaderboard
coderabbit review src/components/Leaderboard.tsx

# Review Dashboard
coderabbit review src/components/ImprovedDashboard.tsx
```

#### Tests
```bash
# Review service tests
coderabbit review src/lib/__tests__/

# Review component tests
coderabbit review src/components/__tests__/

# Review specific test file
coderabbit review src/lib/__tests__/pointsService.test.ts
```

### Integration with Claude Code

#### Get Review Context for AI Agents
```bash
# Get review as prompt for Claude Code
coderabbit review --prompt-only

# This provides token-efficient context that Claude Code can use
# to understand issues and automatically fix them
```

#### Generate-Review-Iterate Workflow
```bash
# 1. Let Claude Code generate code
# (your normal development workflow)

# 2. Review with CodeRabbit
coderabbit review --plain

# 3. Feed issues back to Claude Code
coderabbit review --prompt-only

# 4. Let Claude Code fix issues
# (Claude Code will automatically address the issues)

# 5. Repeat until clean
```

## ⚙️ Configuration

### Project Config: `.coderabbit.yaml`
- Defines review preferences
- Sets project-specific instructions
- Enables/disables tools (ESLint, Biome, etc.)
- Located at: `/mnt/c/users/akhil/ReddyfitWebsiteready/.coderabbit.yaml`

### Ignore File: `.coderabbitignore`
- Excludes files from review (node_modules, dist, etc.)
- Protects sensitive files (.env)
- Skips generated files
- Located at: `/mnt/c/users/akhil/ReddyfitWebsiteready/.coderabbitignore`

## 🎓 Review Focus Areas

CodeRabbit will focus on:

1. **Firebase & Firestore**
   - Query optimization
   - Security rules compliance
   - Transaction safety

2. **React & TypeScript**
   - Type safety
   - Component optimization
   - Hook dependencies

3. **Social Competition Logic**
   - Points calculation accuracy
   - Leaderboard ranking correctness
   - Friend request validation

4. **Security**
   - User authorization
   - Data access validation
   - Input sanitization

5. **Performance**
   - Firebase query efficiency
   - Component re-render optimization
   - Bundle size

6. **Testing**
   - Test coverage
   - Mock accuracy
   - Edge case handling

## 📊 Common Commands

```bash
# Review current changes
coderabbit review

# Review specific commit
coderabbit review --commit <commit-hash>

# Review with detailed output
coderabbit review --verbose

# Get help
coderabbit --help

# Check auth status
coderabbit auth status
```

## 🔗 Integration with GitHub Actions

### Automated PR Reviews
Add `.github/workflows/coderabbit-review.yml`:
```yaml
name: CodeRabbit Review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install CodeRabbit CLI
        run: curl -fsSL https://cli.coderabbit.ai/install.sh | sh
      - name: Run CodeRabbit Review
        env:
          CODERABBIT_API_KEY: ${{ secrets.CODERABBIT_API_KEY }}
        run: coderabbit review
```

### Add API Key to GitHub Secrets
1. Go to: https://github.com/DandaAkhilReddy/RFC/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CODERABBIT_API_KEY`
4. Value: `cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade`

## 📈 Best Practices

### Before Committing
```bash
# Always review before committing
coderabbit review --plain

# Fix issues identified
# (manually or let Claude Code fix them)

# Review again to verify
coderabbit review --plain

# Commit when clean
git add .
git commit -m "Your message"
```

### For Large Changes
```bash
# Review incrementally
coderabbit review src/lib/pointsService.ts
coderabbit review src/components/FriendsPage.tsx
# ... one file at a time

# Or review by type
coderabbit review src/lib/
coderabbit review src/components/
```

### For Refactoring
```bash
# Get baseline review before refactoring
coderabbit review > before-review.txt

# Make changes
# ...

# Compare after refactoring
coderabbit review > after-review.txt
diff before-review.txt after-review.txt
```

## 🆘 Troubleshooting

### API Key Not Working
```bash
# Check if key is set
echo $CODERABBIT_API_KEY

# Re-export if empty
export CODERABBIT_API_KEY="cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade"

# Check auth status
coderabbit auth status
```

### CLI Not Found
```bash
# Reinstall CodeRabbit CLI
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

# Add to PATH if needed
export PATH="$HOME/.coderabbit/bin:$PATH"
```

### Rate Limits
- Free tier has rate limits
- If you hit limits, wait or upgrade to paid tier
- Check status: `coderabbit auth status`

## 📚 Resources

- **CodeRabbit CLI Docs**: https://www.coderabbit.ai/cli
- **GitHub Integration**: https://docs.coderabbit.ai/platforms/github-com
- **Configuration Reference**: https://docs.coderabbit.ai/reference/configuration
- **ReddyFit Repository**: https://github.com/DandaAkhilReddy/RFC

## 🎯 Project-Specific Tips

### Reviewing Points System
```bash
# Review entire points calculation flow
coderabbit review src/lib/pointsService.ts src/components/ImprovedDashboard.tsx

# Check if points are awarded correctly
# CodeRabbit will validate:
# - Meal points: 30 base, +20 for photo = 50 total
# - Workout points: 50 base, +25-75 for calories
```

### Reviewing Friend System
```bash
# Review friend management flow
coderabbit review src/lib/friendsService.ts src/components/FriendsPage.tsx

# CodeRabbit will check:
# - Bidirectional friendship creation
# - Authorization (only recipient can accept)
# - Duplicate request prevention
```

### Reviewing Leaderboards
```bash
# Review leaderboard logic
coderabbit review src/lib/leaderboardService.ts src/components/Leaderboard.tsx

# CodeRabbit will verify:
# - Ranking calculation accuracy
# - Profile enrichment
# - Scope filtering (Friends/City/Country/Global)
```

---

**Last Updated:** 2025-10-07
**CodeRabbit API Key:** `cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade`
