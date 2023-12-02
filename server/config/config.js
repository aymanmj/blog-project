const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  endpoint: process.env.API_URL,
  masterKey: process.env.API_KEY,
  port: process.env.PORT,
  development: {
    dialect: "mysql",
    database: process.env.MYSQL_DB_NAME || "booksDb",
    username: process.env.MYSQL_DB_USERNAME || "root",
    password: process.env.MYSQL_DB_PASSWORD || null,
    host: process.env.MYSQL_DB_HOST || "localhost",
    port: parseInt(process.env.MYSQL_DB_PORT || "3306"),
    timezone: process.env.MYSQL_DB_TIMEZONE || "+02:00",
  },
  test: {
    dialect: "mysql",
    database: process.env.MYSQL_DB_NAME || "booksDb",
    username: process.env.MYSQL_DB_USERNAME || "root",
    password: process.env.MYSQL_DB_PASSWORD || null,
    host: process.env.MYSQL_DB_HOST || "localhost",
    port: parseInt(process.env.MYSQL_DB_PORT || "3306"),
    timezone: process.env.MYSQL_DB_TIMEZONE || "+02:00",
  },
  production: {
    dialect: "mysql",
    database: process.env.MYSQL_DB_NAME,
    username: process.env.MYSQL_DB_USERNAME,
    password: process.env.MYSQL_DB_PASSWORD,
    host: process.env.MYSQL_DB_HOST,
    port: parseInt(process.env.MYSQL_DB_PORT),
    timezone: process.env.MYSQL_DB_TIMEZONE || "+02:00",
  },
};
