const mysql = require('mysql2');
const connection = mysql.createPool({
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.dbDatabase,
  port: process.env.dbPort ?? 3306,
  connectionLimit: 100,
  supportBigNumbers: true,
  bigNumberStrings: true
}).promise();

module.exports = connection;