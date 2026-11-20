
const db = require("../config/db");

// Create a new admission
function createAdmission(admission, callback) {
    const sql = `
        INSERT INTO admissions
        (full_name, email, phone, course, study_mode)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            admission.full_name,
            admission.email,
            admission.phone,
            admission.course,
            admission.study_mode
        ],
        callback
    );
}

// Get all admissions
function getAllAdmissions(callback) {
    const sql = "SELECT * FROM admissions ORDER BY created_at DESC";

    db.query(sql, callback);
}

// Get admission by student email
function getAdmissionByEmail(email, callback) {
    const sql = "SELECT * FROM admissions WHERE email = ?";

    db.query(sql, [email], callback);
}

// Update admission status
function updateAdmissionStatus(id, status, callback) {
    const sql = `
        UPDATE admissions
        SET application_status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], callback);
}

module.exports = {
    createAdmission,
    getAllAdmissions,
    getAdmissionByEmail,
    updateAdmissionStatus
};
