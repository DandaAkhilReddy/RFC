import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as sql from 'mssql';

const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER || '',
  database: process.env.AZURE_SQL_DATABASE || '',
  user: process.env.AZURE_SQL_USER || '',
  password: process.env.AZURE_SQL_PASSWORD || '',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  }
};

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers };
    return;
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM user_profiles');
    
    context.res = {
      status: 200,
      headers,
      body: JSON.stringify(result.recordset)
    };
  } catch (error: any) {
    context.log.error('Error:', error);
    context.res = {
      status: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

export default httpTrigger;
