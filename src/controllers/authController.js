const usersModel = require("../data/mongo/models/usersModel");
const cartModel = require("../data/mongo/models/cartsModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");
const { logger } = require("../utils/logger");

async function signup(req, res) {
    const { firstname, lastname, email, age, password, confirm_password } = req.body;

    try {
        logger.info(`Signup attempt: ${email}`);
        
        if (!email || !firstname || !lastname || !age || !password || !confirm_password) {
            logger.warn(`Signup failed: Missing data - ${email}`);
            return res.status(400).json({ error: "Missing data" });
        }

        if (password !== confirm_password) {
            logger.warn(`Signup failed: Passwords don't match - ${email}`);
            return res.status(400).json({ error: "Passwords don't match" });
        }

        const userExists = await usersModel.findOne({ email });
        if (userExists) {
            logger.warn(`Signup failed: User already exists - ${email}`);
            return res.status(400).json({ error: "This account is already registered" });
        }

        const newCart = await cartModel.create({});
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await usersModel.create({
            firstname,
            lastname,
            email,
            age,
            password: hashedPassword,
            cartId: newCart._id
        });

        // Generar token con toda la información del usuario (incluyendo admin y premium)
        const token = generateToken({
            _id: newUser._id,
            email: newUser.email,
            admin: newUser.admin || false,
            premium: newUser.premium || false,
            cartId: newUser.cartId
        });

        logger.success(`User created successfully: ${email} (ID: ${newUser._id})`);

        return res.status(201).json({
            message: "User created",
            user: {
                id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                age: newUser.age,
                cartId: newUser.cartId
            },
            token
        });

    } catch (error) {
        logger.error(`Signup error: ${error.message} - ${email}`, error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        logger.info(`Login attempt: ${email}`);
        
        const user = await usersModel.findOne({ email });
        if (!user) {
            logger.warn(`Login failed: User not found - ${email}`);
            return res.status(400).json({ error: "This account doesn't exist" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logger.warn(`Login failed: Invalid password - ${email}`);
            return res.status(400).json({ error: "Your password is incorrect" });
        }

        await usersModel.findOneAndUpdate(
            { email },
            { last_connection: new Date() }
        );

        // Generar token con toda la información del usuario (incluyendo admin y premium)
        const token = generateToken({
            _id: user._id,
            email: user.email,
            admin: user.admin || false,
            premium: user.premium || false,
            cartId: user.cartId
        });

        logger.success(`Login successful: ${email} (ID: ${user._id})`);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                age: user.age,
                cartId: user.cartId
            },
            token
        });

    } catch (error) {
        logger.error(`Login error: ${error.message} - ${email}`, error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = { signup, login };