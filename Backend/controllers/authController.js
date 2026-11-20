
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({
            message: "Please fill all required fields."
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (full_name, email, password, role)
            VALUES (?, ?, ?, 'student')
        `;

        db.query(
            sql,
            [full_name, email.trim().toLowerCase(), hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Email already registered."
                        });
                    }

                    return res.status(500).json({
                        message: "Registration failed."
                    });
                }

                res.status(201).json({
                    message: "Registration successful!",
                    userId: result.insertId
                });
            }
        );

    } catch (error) {
        res.status(500).json({
            message: "Server error."
        });
    }
};


const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required."
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email.trim().toLowerCase()], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Login failed."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid email or password."
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({
                message: "Login successful!",
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            res.status(500).json({
                message: "Login error."
            });
        }
    });
};


module.exports = {
    register,
    login
};
