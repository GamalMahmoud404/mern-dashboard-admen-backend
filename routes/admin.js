const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// تسجيل الدخول
router.post("/login", async (req, res) => {
    const { name, password } = req.body;

    try {
        const admin = await Admin.findOne({ name });
        if (!admin) return res.status(401).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: admin._id, name: admin.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            message: "Login successful",
            token,
            admin: {
                name: admin.name,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
});

// تسجيل أدمن جديد
router.post("/register", async (req, res) => {
    const { name, password } = req.body;

    try {
        const existing = await Admin.findOne({ name });
        if (existing) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({ name, password: hashedPassword });
        await newAdmin.save();

        res.json({ message: "Admin registered successfully" });
    } catch (err) {
        console.error("❌ Registration error:", err); 
        res.status(500).json({ message: "Registration error" });
    }
});

module.exports = router;
