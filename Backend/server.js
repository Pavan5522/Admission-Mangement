
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const admissionRoutes = require("./routes/admissionRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const verifyToken = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Nexora University Backend is Running!");
});

// Test database connection
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

// Application routes
app.use("/api/admissions", admissionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

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

const PORT = process.env.PORT || 5000;


console.log("Registered routes:", app._router?.stack?.map(r => r.route?.path).filter(Boolean));

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});