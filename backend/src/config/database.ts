import mysql, {
  Pool,
  PoolConnection,
  PoolOptions,
  QueryResult,
  RowDataPacket,
} from "mysql2/promise";
import { env } from "./env";

const poolConfig: PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: env.DB_QUEUE_LIMIT,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  decimalNumbers: true,
  timezone: "Z",
  namedPlaceholders: false,
};

export const pool: Pool = mysql.createPool(poolConfig);

export async function testDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

export async function getConnection(): Promise<PoolConnection> {
  return pool.getConnection();
}

export async function query<T extends QueryResult>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [result] = await pool.query<T>(sql, params);
  return result;
}

export async function queryRows<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const [rows] = await pool.query<T[]>(sql, params);
  return rows;
}

export async function closeDatabasePool(): Promise<void> {
  await pool.end();
}
