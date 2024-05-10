const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb://localhost:27017/surya';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log("Connected to Database"));

const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    phno: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model("users", Loginschema);

app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await collection.findOne({ name });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            return res.json({ success: true, message: 'Login successful' });
        } else {
            return res.json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post("/sign_up", async (req, res) => {
    try {
        const { name, email, phno, password } = req.body;
        const existingUser = await collection.findOne({ name });
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists' });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await collection.create({ name, email, phno, password: hashedPassword });
            return res.json({ success: true, message: 'User registered successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.get("/", (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    res.sendFile(filePath);
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
