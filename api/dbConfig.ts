import * as sql from 'mssql';

const config: sql.config = {
  server: process.env.AZURE_SQL_SERVER || 'reddyfit-sql-server.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'reddyfitdb',
  user: process.env.AZURE_SQL_USER || 'reddyfitadmin',
  password: process.env.AZURE_SQL_PASSWORD || '',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 15000,
    requestTimeout: 15000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (!pool || !pool.connected) {
      console.log('Creating new database connection...');
      console.log('Server:', config.server);
      console.log('Database:', config.database);
      console.log('User:', config.user);

      if (pool) {
        await pool.close();
      }

      pool = await sql.connect(config);
      console.log('✅ Database connected successfully');
    }
    return pool;
  } catch (error: any) {
    console.error('❌ Database connection error:', error.message);
    console.error('Connection config:', {
      server: config.server,
      database: config.database,
      user: config.user,
      hasPassword: !!config.password
    });
    throw error;
  }
}

export { sql };
