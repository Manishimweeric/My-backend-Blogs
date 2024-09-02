
const express = require('express');
const passport = require('../Utilities/passport_configuration'); 
const userController = require('../controller/UserController');
const { validateSignup, validateLogin } = require('../middlewares/validattion');

const router = express.Router();

/**
 * @openapi
 * /api/users/signup:
 *   post:
 *     tags:
 *       - Users
 *     description: Sign up a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mysecurepassword
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '201':
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signup successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       '400':
 *         description: Bad request - Invalid data provided
 *       '500':
 *         description: Internal server error
 */
router.post('/users/signup', validateSignup, userController.signup);

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags:
 *       - Users
 *     description: Login a user and return a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mysecurepassword
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: Bearer eyJhbGciOiJIUzI1NiIsIn...
 *       '401':
 *         description: Authentication failed - Invalid credentials
 *       '500':
 *         description: Internal server error
 */
router.post('/user/login', validateLogin, userController.login);

module.exports = router;
