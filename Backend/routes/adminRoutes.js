
const express = require("express");
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
    createAdmission,
    getAllAdmissions,
    updateAdmissionStatus,
    getStudentLatestAdmission
} = require("../controllers/admissionController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// Upload folder
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}


// File storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname).toLowerCase();

        cb(null, uniqueName);
    }
});


// File validation
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "photo") {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowed.includes(file.mimetype)) {
            return cb(null, true);
        }
    }

    if (file.fieldname === "certificate") {
        const allowed = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        if (allowed.includes(file.mimetype)) {
            return cb(null, true);
        }
    }

    cb(new Error("Invalid file format."));
};


// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


// Handle upload errors with JSON responses
const uploadAdmissionFiles = (req, res, next) => {
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "certificate", maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.message || "File upload failed."
            });
        }

        next();
    });
};


// Student submits application
router.post(
    "/",
    verifyToken,
    authorizeRoles("student"),
    uploadAdmissionFiles,
    createAdmission
);


// Admin views all applications
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    getAllAdmissions
);


// Student views own application
router.get(
    "/student/me",
    verifyToken,
    authorizeRoles("student"),
    getStudentLatestAdmission
);


// Admin updates application status
router.patch(
    "/:id/status",
    verifyToken,
    authorizeRoles("admin"),
    updateAdmissionStatus
);


module.exports = router;
