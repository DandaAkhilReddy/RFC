#!/usr/bin/env node
/**
 * Update ReddyFit Welcome Email with Beautiful Design
 */
require('dotenv').config();
const axios = require('axios');

const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';

const beautifulEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ReddyFit Club! 🏋️</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #fff5f0 0%, #ffffff 50%, #fff0f0 100%);">

  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff5f0 0%, #ffffff 50%, #fff0f0 100%); padding: 40px 20px;">
    <tr>
      <td align="center">

        <!-- Email Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(234, 88, 12, 0.15); overflow: hidden; max-width: 600px;">

          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 60px 40px; text-align: center;">
              <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <span style="font-size: 48px;">🔥</span>
              </div>
              <h1 style="color: white; font-size: 36px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Welcome to ReddyFit!</h1>
              <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0; font-weight: 500;">Your AI-Powered Fitness Journey Starts Now</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 50px 40px;">

              <!-- Personalized Greeting -->
              <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 20px 0;">
                Hey {{displayName}}! 👋
              </h2>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                We're <strong style="color: #ea580c;">thrilled</strong> to have you join the ReddyFit community! Get ready to transform your fitness journey with AI-powered personalization, smart tracking, and a community that motivates.
              </p>

              <!-- Quick Start Guide -->
              <div style="background: linear-gradient(135deg, #fff5f0 0%, #fef2f2 100%); border-radius: 16px; padding: 30px; margin: 0 0 30px 0; border-left: 4px solid #ea580c;">
                <h3 style="color: #ea580c; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">⚡</span> Quick Start in 3 Steps
                </h3>

                <!-- Step 1 -->
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: start;">
                    <div style="background: #ea580c; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; margin-right: 16px;">1</div>
                    <div>
                      <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 6px 0;">Complete Your Profile</h4>
                      <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">Add your fitness goals, body metrics, and preferences for personalized AI recommendations.</p>
                    </div>
                  </div>
                </div>

                <!-- Step 2 -->
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: start;">
                    <div style="background: #ea580c; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; margin-right: 16px;">2</div>
                    <div>
                      <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 6px 0;">Chat with Reddy AI</h4>
                      <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">Get instant workout plans, meal suggestions, and fitness advice from our AI coach.</p>
                    </div>
                  </div>
                </div>

                <!-- Step 3 -->
                <div>
                  <div style="display: flex; align-items: start;">
                    <div style="background: #ea580c; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; margin-right: 16px;">3</div>
                    <div>
                      <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 6px 0;">Start Your Streak</h4>
                      <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">Build consistency with our discipline tracker and watch your streak grow! 🔥</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 0 0 30px 0;">
                <a href="https://delightful-sky-0437f100f.2.azurestaticapps.net" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 10px 30px rgba(234, 88, 12, 0.3); transition: all 0.3s;">
                  🚀 Launch Your Dashboard
                </a>
              </div>

              <!-- Features Grid -->
              <div style="margin: 0 0 30px 0;">
                <h3 style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">What's Inside Your Dashboard</h3>

                <table width="100%" cellpadding="10" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding: 15px; background: #f9fafb; border-radius: 12px; vertical-align: top;">
                      <div style="font-size: 32px; margin-bottom: 8px;">🤖</div>
                      <h4 style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">AI Fitness Coach</h4>
                      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">Personalized workout & meal plans</p>
                    </td>
                    <td width="50%" style="padding: 15px; background: #f9fafb; border-radius: 12px; vertical-align: top;">
                      <div style="font-size: 32px; margin-bottom: 8px;">🔥</div>
                      <h4 style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">Streak Tracking</h4>
                      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">Build discipline & consistency</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding: 15px; background: #f9fafb; border-radius: 12px; vertical-align: top;">
                      <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
                      <h4 style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">Progress Analytics</h4>
                      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">Track calories, workouts & goals</p>
                    </td>
                    <td width="50%" style="padding: 15px; background: #f9fafb; border-radius: 12px; vertical-align: top;">
                      <div style="font-size: 32px; margin-bottom: 8px;">💪</div>
                      <h4 style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">Smart Recommendations</h4>
                      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">AI-powered fitness insights</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Support Section -->
              <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 0 0 20px 0; border-left: 4px solid #10b981;">
                <h4 style="color: #047857; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">💬 Need Help Getting Started?</h4>
                <p style="color: #065f46; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6;">
                  Our AI chatbot is available 24/7 to answer your questions, create custom workout plans, and provide nutrition advice tailored to your goals.
                </p>
                <p style="color: #065f46; font-size: 14px; margin: 0;">
                  Just login and start chatting! 🗨️
                </p>
              </div>

              <!-- Social Proof -->
              <div style="text-align: center; padding: 20px 0; border-top: 2px solid #f3f4f6; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0;">Join thousands achieving their fitness goals</p>
                <div style="color: #fbbf24; font-size: 20px; letter-spacing: 2px;">⭐⭐⭐⭐⭐</div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                Ready to transform? Let's go! 💪
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 20px 0; line-height: 1.6;">
                This email was sent because you registered at ReddyFit Club.<br>
                Your account is ready at: <a href="https://delightful-sky-0437f100f.2.azurestaticapps.net" style="color: #ea580c; text-decoration: none; font-weight: 600;">delightful-sky-0437f100f.2.azurestaticapps.net</a>
              </p>

              <!-- Social Links -->
              <div style="margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 12px 0;">Follow us for fitness tips & motivation:</p>
                <div style="display: inline-block;">
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 24px;">📱</a>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 24px;">🐦</a>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 24px;">📷</a>
                </div>
              </div>

              <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
                © 2025 ReddyFit Club. All rights reserved.<br>
                Powered by AI • Built for Champions 🏆
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

const updatedWorkflow = {
  "name": "ReddyFit - Welcome Email on Registration",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "reddyfit-new-user",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook - New User Registration",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "reddyfit-new-user"
    },
    {
      "parameters": {
        "fromEmail": "noreply@reddyfit.club",
        "toEmail": "={{$json.email}}",
        "subject": "🎉 Welcome to ReddyFit Club - Your AI Fitness Journey Starts Now!",
        "emailType": "html",
        "message": beautifulEmailTemplate,
        "options": {
          "senderName": "ReddyFit Team"
        }
      },
      "name": "Send Beautiful Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [450, 300],
      "credentials": {
        "smtp": {
          "id": "1",
          "name": "Gmail SMTP"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\"success\": true, \"message\": \"Welcome email sent to \" + $json.email}",
        "options": {}
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook - New User Registration": {
      "main": [[{
        "node": "Send Beautiful Welcome Email",
        "type": "main",
        "index": 0
      }]]
    },
    "Send Beautiful Welcome Email": {
      "main": [[{
        "node": "Success Response",
        "type": "main",
        "index": 0
      }]]
    }
  },
  "active": true,
  "settings": {
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "saveManualExecutions": true,
    "executionTimeout": 3600
  },
  "tags": []
};

async function updateWorkflow() {
  try {
    console.log('\n🎨 Updating ReddyFit Welcome Email with Beautiful Design...\n');

    // Update the workflow
    const response = await axios.put(
      `${N8N_URL}/api/v1/workflows/nhOxTPiua6boCcjA`,
      updatedWorkflow,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Email design updated successfully!\n');
    console.log('📧 New Features:');
    console.log('   • Professional gradient header with ReddyFit branding');
    console.log('   • Personalized greeting with user name');
    console.log('   • Beautiful 3-step quick start guide');
    console.log('   • Feature showcase grid');
    console.log('   • Prominent CTA button');
    console.log('   • Support section highlighting AI chatbot');
    console.log('   • Social proof with star rating');
    console.log('   • Professional footer with links\n');
    console.log('🧪 Test the new design:');
    console.log('   node test-welcome-email.js your-email@gmail.com "Your Name"\n');

  } catch (error) {
    console.error('❌ Error updating workflow:', error.response?.data || error.message);
  }
}

updateWorkflow();
