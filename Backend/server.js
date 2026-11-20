
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


app.get("/api/test-db", (req, res) => {
    db.query("SELECT 1", (err) => {
        if (err) {
            return res.status(500).json({
                message: "Database query failed"
            });
        }

        res.json({
            message: "MySQL connection is working!"
        });
    });
});


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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
