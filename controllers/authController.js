const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {getOrSetCache} = require("../middlewares/redisMiddleware");

let refreshTokens = [];

exports.signUp = async (req, res) => {
    const {username, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            }
        });
    } catch (e) {
        console.log(e);
        res.status(400).json({
            status: 'fail'
        });
    }
};

exports.login = async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({username});

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Incorrect username or password'
            });
        }

        const accessToken = generateAccessToken(username);
        const refreshToken = generateRefreshToken(username);

        const isCorrect = await bcrypt.compare(password, user.password);

        if (isCorrect) {
            res.status(200).json({
                status: 'success',
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'Incorrect username or password'
            });
        }
    } catch (e) {
        console.log(e);
        res.status(400).json({
            status: 'fail',
        });
    }
};

exports.logout = (req, res) => {
    refreshTokens = refreshTokens.filter(e => e.token !== req.body.token);
    res.sendStatus(204);
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await getOrSetCache('users', await User.find(), res, 'Users not found');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
            }
        });
    } catch (e) {
        console.log(e);
        res.status(400).json({
            status: 'fail',
        });
    }
};

//TODO separate these middlewares
// ===== Middlewares =====
function generateAccessToken(username) {
    return jwt.sign({name: username}, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn: process.env.JWT_ACCESS_TIME});
}

function generateRefreshToken(username) {
    const refreshToken = jwt.sign({name: username}, process.env.JWT_REFRESH_TOKEN_SECRET, {expiresIn: process.env.JWT_REFRESH_TIME});

    let storedRefreshToken = refreshTokens.find(e => e.username === username);
    if (!storedRefreshToken) {
        refreshTokens.push({
            username: username,
            token: refreshToken
        });
    } else {
        refreshTokens[refreshTokens.findIndex(e => e.username === username)].token = refreshToken;
    }
    return refreshToken
}

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

exports.verifyRefreshToken = (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);
    const loggedOut = refreshTokens.some(e => e.token === refreshToken)
    if (!loggedOut) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken});
    });
}
