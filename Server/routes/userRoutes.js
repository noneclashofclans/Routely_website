const express = require('express')
const router = express.Router();
const User = require ('../models/userModel');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post('/register', async(req, res) => {
    try{
        const { name, email, password } = req.body;


        if (!email || !name || !password){
            return res.status(400).json({message: 'Pls fill all the fields'});
        }

        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({message: 'User with the given mail address has already registered'})
        }
        // passsword hashing
        const salting = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salting);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            name: newUser.name,
            email: newUser.email,
        });
    }catch(error){
        console.log(error.message);
        res.status(500).json({message: 'Error during registration'});
    }
});

router.post('/login', async(req, res) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const hasMatched = await bcrypt.compare(password, user.password);

        if (!hasMatched){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const payload = { userEmail: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Logged in successfully!',
            token,
            user: {
                name: user.name,
                email: user.email,
            },
        });

    }catch(error){
        console.log(error.message);
        res.status(500).json({message: "Error during login"});
    }
});

module.exports = router;