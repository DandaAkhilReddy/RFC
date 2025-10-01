import * as sql from 'mssql';

const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER || 'reddyfit-sql-server.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'reddyfitdb',
  user: process.env.AZURE_SQL_USER || 'reddyfitadmin',
  password: process.env.AZURE_SQL_PASSWORD || '',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export { sql };
