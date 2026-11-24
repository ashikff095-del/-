const bcrypt = require("bcryptjs");

const users = new Map();

async function register(username, password) {
    if (!username || !password || password.length < 8) {
        throw new Error("Username and 8-character password required");
    }

    if (users.has(username)) {
        throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    users.set(username, {
        username,
        password: hashedPassword
    });

    return "Registration successful";
}

async function login(username, password) {
    const user = users.get(username);

    if (!user) {
        throw new Error("User not found");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        throw new Error("Incorrect password");
    }

    return "Login successful";
}

module.exports = { register, login };
