
const express = require("express");
const router = express.Router();

const {
    createAdmission,
    getAllAdmissions,
    updateAdmissionStatus,
    getStudentLatestAdmission
} = require("../controllers/admissionController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Student can submit an application
router.post("/", verifyToken, authorizeRoles("student"), createAdmission);

// Only admin can view all applications
router.get("/", verifyToken, authorizeRoles("admin"), getAllAdmissions);

// Student can view their own application
router.get("/student/me", verifyToken, authorizeRoles("student"), getStudentLatestAdmission);

// Only admin can update application status
router.patch("/:id/status", verifyToken, authorizeRoles("admin"), updateAdmissionStatus);

module.exports = router;
