
const db = require("../config/db");
const fs = require("fs");
const path = require("path");


// Delete uploaded files if submission fails
const deleteUploadedFiles = (files) => {
    if (!files) return;

    Object.values(files).flat().forEach(file => {
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error("File cleanup error:", err.message);
            }
        });
    });
};


// Create Admission
const createAdmission = (req, res) => {

    const {
        full_name,
        phone,
        date_of_birth,
        gender,
        address,
        qualification,
        percentage,
        passing_year,
        course,
        study_mode
    } = req.body || {};

    const email = req.user.email;

    const photo = req.files?.photo?.[0];
    const certificate = req.files?.certificate?.[0];


    // Validate form fields
    if (
        !full_name ||
        !phone ||
        !date_of_birth ||
        !gender ||
        !address ||
        !qualification ||
        percentage === undefined ||
        percentage === "" ||
        !passing_year ||
        !course ||
        !study_mode
    ) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
            message: "Please fill in all required fields."
        });
    }


    // Validate documents
    if (!photo || !certificate) {
        deleteUploadedFiles(req.files);

        return res.status(400).json({
            message: "Please upload your student photo and educational certificate."
        });
    }


    // Save file paths
    const photoPath = `/uploads/${photo.filename}`;
    const certificatePath = `/uploads/${certificate.filename}`;


    // Insert application into TiDB
    const sql = `
        INSERT INTO admissions
        (
            full_name,
            email,
            phone,
            date_of_birth,
            gender,
            address,
            qualification,
            percentage,
            passing_year,
            course,
            study_mode,
            photo_path,
            certificate_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [
        full_name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        qualification,
        percentage,
        passing_year,
        course,
        study_mode,
        photoPath,
        certificatePath
    ];


    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("Admission database error:", err);

            deleteUploadedFiles(req.files);

            return res.status(500).json({
                message: "Failed to save admission application."
            });
        }


        return res.status(201).json({
            message: "Application submitted successfully!",
            applicationId: result.insertId,
            photo: photoPath,
            certificate: certificatePath
        });

    });

};


// Get All Admissions
const getAllAdmissions = (req, res) => {

    const sql = `
        SELECT *
        FROM admissions
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Fetch admissions error:", err);

            return res.status(500).json({
                message: "Failed to fetch applications."
            });
        }

        res.json(results);

    });

};


// Update Application Status
const updateAdmissionStatus = (req, res) => {

    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
        "Pending",
        "Approved",
        "Rejected"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid application status."
        });
    }


    const sql = `
        UPDATE admissions
        SET application_status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {
            console.error("Update status error:", err);

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


// Get Student's Latest Admission
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
            console.error("Student admission fetch error:", err);

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
