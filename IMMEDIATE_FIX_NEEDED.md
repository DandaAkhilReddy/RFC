# ⚠️ API STILL NOT WORKING - IMMEDIATE FIX REQUIRED

## Current Status:
❌ **API endpoints returning 404/500 errors**
❌ **Database save operations failing**
❌ **Users cannot complete onboarding**

## Problem:
Azure Functions deployment is failing due to mixing v3 and v4 programming models.

## WORKING SOLUTION:

Use Azure Web App with Express.js instead of Azure Functions:

### Step 1: Create Express API (5 minutes)
```bash
cd ReddyfitWebsiteready
mkdir express-api
cd express-api
npm init -y
npm install express mssql cors dotenv
```

### Step 2: Create simple server.js:
```javascript
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: { encrypt: true }
};

app.get('/api/users/all', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM user_profiles');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/profile', async (req, res) => {
  try {
    const { email, firebase_uid, full_name, gender } = req.body;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('firebase_uid', sql.NVarChar, firebase_uid)
      .input('full_name', sql.NVarChar, full_name)
      .input('gender', sql.NVarChar, gender)
      .query(`INSERT INTO user_profiles (email, firebase_uid, full_name, gender) 
              VALUES (@email, @firebase_uid, @full_name, @gender)`);
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Step 3: Deploy to Azure Web App
```bash
az webapp create \
  --resource-group sixpack-rg \
  --plan reddyfit-plan \
  --name reddyfit-express-api \
  --runtime "NODE:18-lts"

# Set environment variables
az webapp config appsettings set \
  --name reddyfit-express-api \
  --resource-group sixpack-rg \
  --settings \
    AZURE_SQL_SERVER="reddyfit-sql-server.database.windows.net" \
    AZURE_SQL_DATABASE="reddyfitdb" \
    AZURE_SQL_USER="reddyfitadmin" \
    AZURE_SQL_PASSWORD="ReddyFit@2025SecurePass!"

# Deploy
az webapp deployment source config-zip \
  --resource-group sixpack-rg \
  --name reddyfit-express-api \
  --src api.zip
```

### Step 4: Update frontend
Change `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://reddyfit-express-api.azurewebsites.net';
```

## Why Express is Better:
✅ Simple and reliable
✅ Works immediately
✅ No Azure Functions complexity
✅ Easy to debug
✅ Full control

## Timeline:
- Express API: 15 minutes to set up and deploy
- Azure Functions: Still broken after hours of debugging

**Recommendation: Switch to Express.js API immediately**
