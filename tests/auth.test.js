const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel =  require('../models/User');
const userController = require('../controller/UserController');
const { validateSignup, validateLogin } = require('../middlewares/validattion');

// Create an express application for testing
const app = express();
app.use(express.json());

// Define the routes
app.post('/users/signup', validateSignup, userController.signup);
app.post('/user/login', validateLogin, userController.login);

const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// beforeEach(async () => {
//   await UserModel.deleteMany({});
// });

describe('Authentication API', () => {
  describe('POST /users/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/users/signup')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Signup successful');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');

     
      const user = await UserModel.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.email).toBe('test@example.com');
    });

    it('should return 500 if there\'s a server error', async () => {
      
      jest.spyOn(UserModel.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/users/signup')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error signing up');
    });

   
  });

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  
    // Verify the token
    const token = res.body.token.split(' ')[1]; // Strip 'Bearer' prefix
    const decoded = jwt.verify(token, 'secret_key123');
    expect(decoded).toHaveProperty('id');
  });
  
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication failed');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication failed');
    });

    it('should return 500 if there\'s a server error', async () => {
      // Simulate a database error
      jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error logging in');
    });

  
