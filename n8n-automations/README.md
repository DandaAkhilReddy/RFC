# 🤖 ReddyFit n8n Email Automations

Professional email automation system for ReddyFit using n8n.

## 📁 Project Structure

```
n8n-automations/
├── README.md                    # This file
├── workflows/                   # n8n workflow JSON exports
│   └── welcome-email.json      # Welcome email workflow
├── templates/                   # Email HTML templates
│   └── welcome-email.html      # Beautiful welcome email design
├── scripts/                     # Automation scripts
│   ├── test-welcome-email.js   # Test script for welcome emails
│   └── deploy-workflow.js      # Deploy workflows to n8n
├── docs/                        # Documentation
│   ├── SETUP.md               # Setup instructions
│   ├── INTEGRATION.md         # Integration guide for ReddyFit app
│   └── CUSTOMIZATION.md       # How to customize emails
└── .env.example                # Environment variables template
```

## 🚀 Features

### ✅ Welcome Email Automation
- **Triggers**: When a new user registers on ReddyFit
- **Sends**: Beautiful branded welcome email via Gmail
- **Includes**:
  - Personalized greeting with user's name
  - 3-step quick start guide
  - Feature showcase grid
  - Prominent CTA button to dashboard
  - AI chatbot support section
  - Professional footer with social links

### 📧 Email Design Highlights
- Responsive HTML design
- ReddyFit brand colors (Orange/Red gradient)
- Mobile-friendly layout
- Professional typography
- Emoji-enhanced content
- Call-to-action buttons
- Social proof elements

## ⚙️ Setup

### Prerequisites
- n8n instance running (local or cloud)
- Gmail account with App Password configured
- Node.js installed

### Quick Start

1. **Configure Gmail App Password**
   ```
   1. Go to: https://myaccount.google.com/apppasswords
   2. Generate app password for "Mail"
   3. Copy the 16-character password
   ```

2. **Set up n8n SMTP Credentials**
   ```
   1. Open n8n: http://localhost:5678
   2. Go to Credentials → Add Credential
   3. Search for "SMTP"
   4. Fill in:
      - Host: smtp.gmail.com
      - Port: 587
      - User: your-email@gmail.com
      - Password: [16-char app password]
      - Secure: Yes (TLS)
      - Name: Gmail SMTP
   5. Test connection → Save
   ```

3. **Import Workflow**
   ```bash
   # In n8n dashboard
   1. Click "Import from File"
   2. Select: workflows/welcome-email.json
   3. Activate the workflow
   ```

4. **Test the Automation**
   ```bash
   cd n8n-automations/scripts
   node test-welcome-email.js your-email@gmail.com "Your Name"
   ```

## 🔗 Integration with ReddyFit App

Add this code to your Firebase Authentication signup handler:

```javascript
// src/components/AuthProvider.tsx

const sendWelcomeEmail = async (user) => {
  try {
    await fetch('http://localhost:5678/webhook/reddyfit-new-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        displayName: user.displayName || user.name,
        uid: user.uid
      })
    });
    console.log('✅ Welcome email triggered for:', user.email);
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }
};

// Call after successful registration
signInWithPopup(auth, googleProvider).then(async (result) => {
  const user = result.user;

  // Check if new user (optional)
  const isNewUser = result.additionalUserInfo?.isNewUser;

  if (isNewUser) {
    await sendWelcomeEmail(user);
  }
});
```

## 📊 Monitoring

### View Email Executions
1. Open n8n dashboard: http://localhost:5678
2. Click "Executions" in sidebar
3. View status of each email sent

### Success Indicators
- ✅ Green status = Email sent successfully
- ⏱️ Yellow = In progress
- ❌ Red = Failed (check logs)

## 🎨 Customization

### Update Email Template
1. Edit: `templates/welcome-email.html`
2. Deploy changes: Run `scripts/deploy-workflow.js`
3. Test: `scripts/test-welcome-email.js`

### Modify Workflow
1. Open workflow in n8n
2. Edit nodes as needed
3. Export: File → Export → Save to `workflows/`

## 🧪 Testing Checklist

- [ ] Gmail SMTP configured in n8n
- [ ] Workflow imported and activated
- [ ] Test email sent successfully
- [ ] Email appears in inbox (not spam)
- [ ] Links work correctly
- [ ] Mobile responsive design verified
- [ ] Integration code added to app
- [ ] Production webhook URL updated

## 🔐 Environment Variables

Create `.env` file:

```env
# n8n Configuration
N8N_URL=http://localhost:5678
N8N_API_KEY=your-api-key-here

# Firebase (for scripts)
FIREBASE_PROJECT_ID=reddyfit-dcf41
FIREBASE_API_KEY=AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_FROM=noreply@reddyfit.club
```

## 📈 Future Automations

Planned email automations:
- [ ] Onboarding sequence (Days 1, 3, 7)
- [ ] Weekly progress reports
- [ ] Streak milestone celebrations
- [ ] Workout reminders
- [ ] Goal achievement notifications
- [ ] Re-engagement campaigns

## 🆘 Troubleshooting

### Email not sending
1. Check n8n execution logs
2. Verify Gmail SMTP credentials
3. Ensure workflow is activated
4. Check webhook URL is correct

### Email in spam
1. Add DKIM/SPF records (for custom domain)
2. Warm up email sending gradually
3. Test with Gmail Test Mode

### Template not updating
1. Clear n8n cache
2. Reimport workflow
3. Restart n8n instance

## 📞 Support

For issues or questions:
- Check `docs/` folder for detailed guides
- Review n8n execution logs
- Test with `scripts/test-welcome-email.js`

---

**Version**: 1.0.0
**Last Updated**: 2025-01-02
**Maintained by**: ReddyFit Team
