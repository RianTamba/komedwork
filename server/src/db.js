// src/db.js
// Connection pool ke MariaDB/MySQL menggunakan mysql2 promise API.
//
// dateStrings: ['DATE'] → kolom DATE dikembalikan sebagai string "YYYY-MM-DD",
// bukan objek Date JavaScript yang rentan pergeseran timezone (WIB UTC+7).

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host:        process.env.DB_HOST     || 'localhost',
  port:        parseInt(process.env.DB_PORT || '3306', 10),
  user:        process.env.DB_USER     || 'root',
  password:    process.env.DB_PASSWORD || '',
  database:    process.env.DB_NAME     || 'komedwork_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  // Kembalikan kolom DATE sebagai string "YYYY-MM-DD" (bukan Date object)
  // agar tidak terjadi pergeseran saat konversi timezone WIB (UTC+7).
  dateStrings: ['DATE'],
});

export default pool;
