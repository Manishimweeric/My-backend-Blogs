
const express = require('express');
const router = express.Router();
const upload = require('../Utilities/multer');
const blogController = require('../controller/BlogController');
const userController = require('../controller/UserController');
const { isAuthenticated } = require('../middlewares/authentication');

router.post('/users', userController.signup);
router.post('/user', userController.login);

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Add new blog
 *     tags:
 *       - Blogs
 *     description: Create a new blog with an image upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the blog
 *               content:
 *                 type: string
 *                 description: Content of the blog
 *               author:
 *                 type: string
 *                 description: Author of the blog
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to be uploaded
 *     responses:
 *       '201':
 *         description: Blog created successfully
 *       '400':
 *         description: Bad request - Missing image or required fields
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
 */

router.post('/blogs', isAuthenticated,upload,blogController.createBlogPost);
router.post('/blog', isAuthenticated, blogController.createBlog);

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Retrive all blogs
 *     tags: [Blogs]
 *     responses:
 *       '200':
 *         description: Successfully retrieved all Blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 *       '500':
 *         description: Internal server error
 */

router.get('/blogs',blogController.getAllBlogPosts);

router.get('/blogs/countss',blogController.CountLikesAndComments);


/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Fetch a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved the blog
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       '404':
 *         description: Blog not found
 *       '500':
 *         description: Internal server error
 */

router.get('/blogs/:id',blogController.getBlogById);


/**
 * @openapi
 * /api/blogs/{id}:
 *   patch:
 *     summary: Update a blog 
 *     tags:
 *       - Blogs
 *     description: Update a specific blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       '200':
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       '400':
 *         description: Bad request - Invalid data provided
 *       '404':
 *         description: Blog not found
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
 */

router.patch('/blogs/:id', isAuthenticated,blogController.UpdateBlog);

/**
 * @openapi
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog 
 *     tags:
 *       - Blogs
 *     description: Delete a specific blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to delete
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Blog deleted successfully
 *       '404':
 *         description: Blog not found
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
*/

router.delete('/blogs/:id', isAuthenticated,blogController.deleteBlog);

/**
 * @openapi
 * /api/blogs/{id}/comments:
 *   post:
 *     summary: Add a comment to a blog 
 *     tags:
 *       - Comments
 *     description: Add a comment to a specific blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to add a comment to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '201':
 *         description: Comment added successfully
 *       '400':
 *         description: Bad request - Invalid data provided
 *       '404':
 *         description: Blog not found
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
 */

router.post('/blogs/:id/comments', isAuthenticated,blogController.SaveComment);


/**
 * @openapi
 * /api/blogs/{id}/comments:
 *   get:
 *     summary: Get all comments for a specific blog 
 *     tags:
 *       - Comments
 *     description: Get all comments for a specific blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to retrieve comments for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '404':
 *         description: Blog not found
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
 */

router.get('/blogs/:id/comments',blogController.GetComment);
/**
 * @openapi
 * /api/blogs/{id}/like:
 *   post:
 *     summary: add a Like to blog 
 *     tags:
 *       - Likes
 *     description: Like a specific blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to like
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Blog liked successfully
 *       '404':
 *         description: Blog not found
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
 */

router.post('/blogs/:id/like',isAuthenticated, blogController.likeBlog);


/**
 * @openapi
 * /api/blogs/{id}/likes:
 *   get:
 *     summary: Retrive all  likes for a specific blog 
 *     tags:
 *       - Likes
 *     description: Get the count of likes for a specific blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to retrieve likes count for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved the likes count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likesCount:
 *                   type: integer
 *                   example: 10
 *       '404':
 *         description: Blog not found
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
 */

router.get('/blogs/:id/likes',isAuthenticated ,blogController.CountLikes);

/**
 * @openapi
 * /api/blogs/{id}/likeusers:
 *   get:
 *     summary: Retrive  all users who liked a specific blog 
 *     tags:
 *       - Likes
 *     description: Get all users who liked a specific blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to retrieve like users for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved users who liked the blog
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       '404':
 *         description: Blog not found
 *       '401':
 *         description: Unauthorized - user authentication failed
 *       '500':
 *         description: Internal server error
 */

router.get('/blogs/:id/likeusers',isAuthenticated ,blogController.getAllLikesAndUsers);


module.exports = router;