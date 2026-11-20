
const admissionModel = require("../models/admissionModel");

// Get all student applications
function getAllApplications(req, res) {
    admissionModel.getAllAdmissions((err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching applications"
            });
        }

        res.json(results);
    });
}

// Update application status
function updateApplicationStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid application status"
        });
    }

    admissionModel.updateAdmissionStatus(id, status, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error updating application status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json({
            message: "Application status updated successfully!"
        });
    });
}

module.exports = {
    getAllApplications,
    updateApplicationStatus
};
