const router = require("express").Router();
const User = require("../models/User");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");


router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const existingUserName = await User.findOne({ username });
        if (existingUserName) {
            return res.status(400).json({ error: "Username already exists. Please choose a different username." });
        }
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: "Email already exists. Please choose a different email." });
    }
    const encryptedPassword = cryptoJS.AES.encrypt(password, process.env.CRYPTO_SECRET_KEY).toString();
    const newUser = new User({
        username,
        email,
        password: encryptedPassword,
    });

    try {
        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});


//login method here

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found. Please check your username and try again." });
        }
        const decryptedPassword = cryptoJS.AES.decrypt(user.password, process.env.CRYPTO_SECRET_KEY).toString(cryptoJS.enc.Utf8);
        if (password !== decryptedPassword) {
            return res.status(401).json({ error: "Invalid password. Please check your password and try again." });
        }
     const accessToken = jwt.sign(
        {id :user._id, isAdmin: user.isAdmin},
        process.env.CRYPTO_SECRET_KEY,{expiresIn:"5d"}
        )

        res.status(200).json({ message: "Login successful", user: { username: user.username, email: user.email, accessToken } });
    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;