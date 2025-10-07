# Complete CodeRabbit Authentication

## 🔑 Step-by-Step Authentication Guide

CodeRabbit CLI is installed and configured, but needs OAuth authentication before first use.

### Step 1: Open WSL Terminal

```powershell
# From Windows PowerShell, open WSL
wsl
```

### Step 2: Run OAuth Login

```bash
# This will open a browser for authentication
coderabbit auth login
```

**What happens:**
1. A browser window will open automatically
2. You'll be redirected to CodeRabbit's login page
3. Sign in or create a free CodeRabbit account
4. Authorize the CLI application
5. Browser will confirm success
6. Return to WSL terminal - authentication complete!

### Step 3: Verify Authentication

```bash
# Check auth status
coderabbit auth status
```

Expected output:
```
✅ Authentication: Logged in
```

### Step 4: Test Review

```bash
# Navigate to project
cd /mnt/c/users/akhil/ReddyfitWebsiteready

# Run a quick test review
coderabbit review --plain --type uncommitted
```

## 🎯 After Authentication

Once authenticated, you can use CodeRabbit from:

### Windows PowerShell

```powershell
# Quick review
.\scripts\coderabbit-review.ps1

# Integration with Claude Code
.\scripts\coderabbit-review.ps1 -Mode prompt-only
```

### WSL Bash

```bash
# Quick review
bash scripts/coderabbit-review.sh

# Claude Code integration workflow
bash scripts/coderabbit-claude-integration.sh
```

## 🔄 Next Steps After Authentication

1. **Add GitHub Secret** (for CI/CD)
   ```bash
   gh secret set CODERABBIT_API_KEY -b"cr-cbcb884bec03f7666bc563a8de1c358ff13329051e9c960add3eeabade"
   ```

2. **Run Initial Review**
   ```powershell
   .\scripts\coderabbit-review.ps1
   ```

3. **Test Claude Code Integration**
   ```bash
   wsl bash scripts/coderabbit-claude-integration.sh
   ```

## ⚠️ If Browser Doesn't Open Automatically

If the browser doesn't open automatically in WSL:

1. **Check for URL in terminal** - CodeRabbit may print an authorization URL
2. **Manually copy and open** the URL in your Windows browser
3. **Complete authentication** in the browser
4. **Return to terminal** - it should detect the completed auth

Alternative method:

```bash
# Try the alternative OAuth command
coderabbit o login
```

## 🆘 Troubleshooting

### "Failed to open browser"

Your default Windows browser should open. If not:
1. Look for the authorization URL printed in terminal
2. Copy it manually and open in browser
3. Complete the OAuth flow
4. Return to terminal

### "Authentication timeout"

```bash
# Try again
coderabbit auth login
```

### Still having issues?

Check the CodeRabbit docs: https://www.coderabbit.ai/cli

---

**Ready to authenticate?** Run these commands:

```powershell
# 1. Open WSL
wsl

# 2. Authenticate
coderabbit auth login

# 3. Verify
coderabbit auth status

# 4. Exit WSL
exit
```

Then come back to Claude Code and say "authentication complete" to continue!
