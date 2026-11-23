
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        minVersion: "TLSv1.2"
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("TiDB Cloud connected successfully!");

    connection.release();
});

module.exports = db;
