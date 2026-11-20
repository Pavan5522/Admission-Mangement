
const admissionModel = require("../models/admissionModel");

// Get student profile
function getStudentProfile(req, res) {
    res.json({
        message: "Student profile fetched successfully!",
        user: req.user
    });
}

// Get student's applications
function getMyAdmissions(req, res) {
    const email = req.user.email;

    admissionModel.getAdmissionByEmail(email, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching student applications"
            });
        }

        res.json(results);
    });
}

module.exports = {
    getStudentProfile,
    getMyAdmissions
};
