const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel =  require('../models/User');
const userController = require('../controller/UserController');
const { validateSignup, validateLogin } = require('../middlewares/validattion');
app.post('/users/signup', validateSignup, userController.signup);
app.post('/user/login', validateLogin, userController.login);

describe('Blog API', () => {
  let mongoServer;
  let createdBlogId;

  const { isAuthenticated } = require('../middlewares/authentication');


const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'mockUserId' };
  next();
};

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    jest.mock('../middlewares/authentication', () => ({
      isAuthenticated: mockAuthMiddleware
    }));

    // Create a user and generate a token for authenticated requests
    const user = await UserModel.create({
      email: 'testuser3@gmail.com',
      password: await bcrypt.hash('password123', 10)
    });
    
    token = jwt.sign({ id: user._id }, 'secret_key123');
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();
  });

  it('should respond to the test route', async () => {
    const res = await request(app)
      .get('/test')
      .expect(200);
    
    expect(res.body).toHaveProperty('message', 'Test route');
  });



  it('should create a new blog post', async () => {
    const res = await request(app)
      .post('/api/blogs') 
        .set('Authorization', `Bearer ${token}`) 
      .send({
        title: 'Test Blog',
        content: 'This is a test blog post.',
        author: 'Test Author'
      })
      .expect(201);

    expect(res.body).toHaveProperty('title', 'Test Blog');
    expect(res.body).toHaveProperty('content', 'This is a test blog post.');
    expect(res.body).toHaveProperty('author', 'Test Author');
    createdBlogId = res.body._id;
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/blogs') 
      .set('Authorization', `Bearer ${token}`) 
      .send({}) 
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });


  it('should get all blog posts', async () => {
    const res = await request(app)
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should get a blog post by id', async () => {
    const res = await request(app)
      .get(`/api/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('title', 'Test Blog');
  });

  it('should update a blog post', async () => {
    const res = await request(app)
      .patch(`/api/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${token}`) 
      .send({ title: 'Updated Test Blog' })
      .expect(200);

    expect(res.body).toHaveProperty('title', 'Updated Test Blog');
  });

  it('should delete a blog post', async () => {
    await request(app)
      .delete(`/api/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${token}`) // Incl
      .expect(204);
  });

  // it('should save a comment', async () => {
  //   const res = await request(app)
  //     .post(`/api/blogs/${createdBlogId}/comments`)
  //     .send({ content: 'Test comment' })
  //     .expect(201);

  //   expect(res.body).toHaveProperty('content', 'Test comment');
  // });

// it('should save a comment', async () => {
//     const res = await request(app)
//       .post(`/api/blogs/${createdBlogId}/comments`)
//       .set('Authorization',`Bearer ${token}`) 
//       .send({ content: 'Test comment' })    
//       .expect(201);

//     expect(res.body).toHaveProperty('content', 'Test comment');
//     expect(res.body).toHaveProperty('postId', createdBlogId.toString());
//   });

  it('should like a blog post', async () => {
    const res = await request(app)
      .post(`/api/blogs/${createdBlogId}/like`)
      .set('Authorization',`Bearer ${token}`) 
      .expect(201);

    expect(res.body).toHaveProperty('message', 'Like added');
  });

  it('should count likes for a blog post', async () => {
    const res = await request(app)
      .get(`/api/blogs/${createdBlogId}/likes`)
      .set('Authorization', `Bearer ${token}`) 
      .expect(200);

    expect(res.body).toHaveProperty('likeCount');
  });

  it('should get all likes and users for a blog post', async () => {
    const res = await request(app)
      .get(`/api/blogs/${createdBlogId}/likeusers`)
      .set('Authorization', `Bearer ${token}`) 
      .expect(200);

    expect(res.body).toHaveProperty('likes');
    expect(Array.isArray(res.body.likes)).toBeTruthy();
  });

  // it('should get comments for a blog post', async () => {
  //   const res = await request(app)
  //     .get(`/api/blogs/${createdBlogId}/comments`)
  //     .set('Authorization',`Bearer ${token}`) 
  //     .expect(200);

  //   expect(Array.isArray(res.body)).toBeTruthy();
  // });
 });