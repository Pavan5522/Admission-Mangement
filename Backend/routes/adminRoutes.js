
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Admin access granted!",
      user: req.user
    });
  }
);

module.exports = router;
