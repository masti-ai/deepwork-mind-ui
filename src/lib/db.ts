import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DOLT_HOST || "127.0.0.1",
  port: parseInt(process.env.DOLT_PORT || "3307"),
  user: process.env.DOLT_USER || "root",
  database: process.env.DOLT_DB || "gt_collab",
  waitForConnections: true,
  connectionLimit: 5,
});

export async function query<T>(sql: string, params?: (string | number | null)[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params ?? []);
  return rows as T[];
}

export default pool;
