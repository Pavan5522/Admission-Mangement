
const bcrypt = require("bcryptjs");

// Hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Compare password
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
};
