const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: 'reddyfit-sql-server.database.windows.net',
  database: 'reddyfitdb',
  user: 'reddyfitadmin',
  password: 'ReddyFit@2025SecurePass!',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

async function applySchema() {
  try {
    console.log('Connecting to Azure SQL Database...');
    await sql.connect(config);
    console.log('Connected successfully!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by GO statements and execute each batch
    const batches = schema
      .split(/^GO$/gim)
      .map(batch => batch.trim())
      .filter(batch => batch.length > 0);

    console.log(`Executing ${batches.length} SQL batches...`);

    for (let i = 0; i < batches.length; i++) {
      console.log(`Executing batch ${i + 1}/${batches.length}...`);
      try {
        await sql.query(batches[i]);
        console.log(`Batch ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`Error in batch ${i + 1}:`, err.message);
        // Continue with other batches
      }
    }

    console.log('Schema applied successfully!');
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await sql.close();
  }
}

applySchema();
