
const db = require("../config/db");

const createAdmission = (req, res) => {
    const {
        full_name,
        phone,
        course,
        study_mode
    } = req.body;

    const email = req.user.email;

    if (!full_name || !email || !course) {
        return res.status(400).json({
            message: "Please fill in all required fields."
        });
    }

    const sql = `
        INSERT INTO admissions
        (full_name, email, phone, course, study_mode)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [full_name, email, phone, course, study_mode],
        (err, result) => {
            if (err) {
                console.log(err.message);
                return res.status(500).json({
                    message: "Failed to submit application."
                });
            }

            res.status(201).json({
                message: "Application submitted successfully!",
                applicationId: result.insertId
            });
        }
    );
};


const getAllAdmissions = (req, res) => {
    const sql = "SELECT * FROM admissions ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch applications."
            });
        }

        res.json(results);
    });
};


const updateAdmissionStatus = (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid application status."
        });
    }

    const sql =
        "UPDATE admissions SET application_status = ? WHERE id = ?";

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to update status."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        res.json({
            message: "Application status updated successfully!"
        });
    });
};



const getStudentLatestAdmission = (req, res) => {
    const email = req.user.email;

    const sql = `
        SELECT *
        FROM admissions
        WHERE email = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch student application."
            });
        }

        if (results.length === 0) {
            return res.json(null);
        }

        res.json(results[0]);
    });
};


module.exports = {
    createAdmission,
    getAllAdmissions,
    updateAdmissionStatus,
    getStudentLatestAdmission
};
