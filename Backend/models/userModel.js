
const db = require("../config/db");

// Create a new user
function createUser(user, callback) {
    const sql = `
        INSERT INTO users (full_name, email, password, role)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user.full_name, user.email, user.password, user.role || "student"],
        callback
    );
}

// Find user by email
function findUserByEmail(email, callback) {
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], callback);
}

// Find user by ID
function findUserById(id, callback) {
    const sql = "SELECT * FROM users WHERE id = ?";

    db.query(sql, [id], callback);
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};
