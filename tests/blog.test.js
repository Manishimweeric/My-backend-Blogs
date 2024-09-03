const request = require('supertest');
const { app, startServer } = require('../index');
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
  
  
  if (mongoose.connection.readyState !== 0) {
   
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
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
})

  it('should respond to the test route', async () => {
    const res = await request(app)
      .get('/test')
      .expect(200);
    
    expect(res.body).toHaveProperty('message', 'Test route');
  });



  it('should create a new blog post', async () => {
    const res = await request(app)
      .post('/api/blog') 
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
      .post('/api/blog') 
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
      .send({ title: 'Updated Title', content: 'Updated Content',author : 'Updated Author' })
      .expect(200);
  });

  it('should return 404 if the blog post does not exist', async () => {
    const nonExistentBlogId = '603dcd781c25b04778b1ef4d';

    const res = await request(app)
      .patch(`/api/blogs/${nonExistentBlogId}`)
      .set('Authorization', `Bearer ${token}`) 
      .send({ title: 'Updated Title', content: 'Updated Content', author: 'Updated Author' })
      .expect(404);

    expect(res.body).toHaveProperty('error', "Post doesn't exist!");
  });


  it('should delete a blog post', async () => {
    await request(app)
      .delete(`/api/blogs/${createdBlogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('should return 404 if the blog post does not exist', async () => {
    const nonExistentBlogId = '603dcd781c25b04778b1ef4dD';
    const res = await request(app)
      .delete(`/api/blogs/${nonExistentBlogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body).toHaveProperty('error', "Post doesn't exist!");
  });

it('should save a comment', async () => {
    const res = await request(app)
      .post(`/api/blogs/${createdBlogId}/comments`)
      .set('Authorization',`Bearer ${token}`) 
      .send({ content: 'Test comment' })    
      .expect(201);

    expect(res.body).toHaveProperty('content', 'Test comment');
    expect(res.body).toHaveProperty('postId', createdBlogId.toString());
  });

  // Test case for handling commenting on a non-existent blog post
  it('should return 404 if the blog post does not exist when trying to save a comment', async () => {
    const nonExistentBlogIds = 'f603dcd781c25b04778b1ef4ds';

    const res = await request(app)
      .post(`/api/blogs/${nonExistentBlogIds}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Test comment connected' })
      .expect(404);

    expect(res.body).toHaveProperty('error', "Post doesn't exist!");
  });


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

  it('should return 404 if the blog post does not exist when trying to retrive all like located in it ', async () => {
    const nonExistentBlogIdsd = 'gsff603dcd781c25b04778b1ef4dsa';

    const res = await request(app)
      .get(`/api/blogs/${nonExistentBlogIdsd}/likes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body).toHaveProperty('error', "Post not found");
  });


  // it('should return 404 if no likes are found for the blog post', async () => {
  //   // Use a blog ID with no likes
  //   const noLikesBlogId = 'some-id-with-no-likes'; // Adjust this ID based on your test setup

  //   // Mocking Likes.find() to return an empty array
  //   jest.spyOn(Likes, 'find').mockResolvedValue([]);

  //   const res = await request(app)
  //     .get(`/api/blogs/${noLikesBlogId}/likeusers`)
  //     .set('Authorization', `Bearer ${token}`)
  //     .expect(404);

  //   expect(res.body).toHaveProperty('message', 'No likes found for this post');
  // });


  it('should get all likes and users for a blog post', async () => {
    const res = await request(app)
      .get(`/api/blogs/${createdBlogId}/likeusers`)
      .set('Authorization', `Bearer ${token}`) 
      .expect(200);

    expect(res.body).toHaveProperty('likes');
    expect(Array.isArray(res.body.likes)).toBeTruthy();
  });

  it('should get comments for a blog post', async () => {
    const res = await request(app)
      .get(`/api/blogs/${createdBlogId}/comments`)
      .set('Authorization',`Bearer ${token}`) 
      .expect(200);

    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should return 404 and the correct message when a server error occurs', async () => {
    const nonExistentBlogIds = 'f603dcd781rtc25b04778b1ef4ds';
    const res = await request(app)
      .get(`/api/blogs/${nonExistentBlogIds}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body).toHaveProperty('message', 'Post not found');
  });

 });