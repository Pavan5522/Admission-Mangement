
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


// Create uploads folder if it doesn't exist
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}


// Configure Multer storage
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


// Allow only required file types
const fileFilter = (req, file, cb) => {

    if (file.fieldname === "photo") {

        const allowedPhotos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedPhotos.includes(file.mimetype)) {
            return cb(null, true);
        }

    }

    if (file.fieldname === "certificate") {

        const allowedCertificates = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        if (allowedCertificates.includes(file.mimetype)) {
            return cb(null, true);
        }

    }

    cb(new Error("Invalid file format."));
};


// Multer upload configuration
const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// Student submits application with photo and certificate
router.post(
    "/",
    verifyToken,
    authorizeRoles("student"),
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "certificate", maxCount: 1 }
    ]),
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
