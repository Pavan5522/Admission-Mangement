
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const db = require("./config/db");

const admissionRoutes = require("./routes/admissionRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const verifyToken = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Serve uploaded photos and certificates
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);


// Home Route
app.get("/", (req, res) => {
    res.send("Nexora University Backend is Running!");
});


// Test Database Connection
app.get("/api/test-db", (req, res) => {

    db.query("SELECT 1", (err) => {

        if (err) {
            return res.status(500).json({
                message: "Database query failed",
                error: err.message
            });
        }

        res.json({
            message: "TiDB Cloud connection is working!"
        });

    });

});


// Application Routes
app.use("/api/admissions", admissionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);


// Student Profile Route
app.get(
    "/api/student/profile",
    verifyToken,
    authorizeRoles("student"),
    (req, res) => {

        res.json({
            message: "Student access granted!",
            user: req.user
        });

    }
);


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
