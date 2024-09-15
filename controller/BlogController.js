const express = require("express");
const Post = require("../models/Blogs");
const User = require("../models/User");
const Comment = require("../models/Blogs_comments");
const Likes = require("../models/Blogs_likes");
const cloudinary = require("../Utilities/cloudinary");
const upload = require("../Utilities/multer");
const fs = require('fs').promises;

const Joi = require('joi');
const { response } = require("..");

exports.createBlogPost = async (req, res) => {
  try {
    
    const { title, content, author } = req.body;

    if (!req.file) {
      return res.status(400).json({ err: 'Please select an image' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Blogs"
    });

    const post = new Post({
      title,
      content,
      author,
      image: result.secure_url,
      public_id: result.public_id
    });

    await post.save();

    await fs.unlink(req.file.path);
    console.log('Sending response:', JSON.stringify({
        message: 'Post created successfully',
        post
      }, null, 2));
      
    return res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    author: Joi.string().required()
  });
  exports.createBlog = async (req, res) => {
    // try {
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const { title, content, author } = req.body;
        const post = new Post({ title, content, author });
        await post.save();
        res.status(201).send(post);
//     } catch (error) {
//         res.status(500).send({ error: "Error creating blog" });
//    }
};

exports.getAllBlogPosts = async (req, res) => {
    const posts = await Post.find();

        // For each post, count the number of likes
        const postsWithLikes = await Promise.all(posts.map(async post => {
            const likeCount = await Likes.countDocuments({ postId: post._id });
            return { ...post._doc, likesCount: likeCount };  // Attach the like count to the response
        }));

        res.send(postsWithLikes);
};

exports.getBlogById = async (req, res) => {
           const post = await Post.findOne({_id: req.params.id});
            res.send(post)
        
};

exports.UpdateBlog = async (req, res) => {
        try {
            const post = await Post.findOne({ _id: req.params.id })
    
            if (req.body.title) {
                post.title = req.body.title
            }
    
            if (req.body.content) {
                post.content = req.body.content
            }
            if (req.body.content) {
                post.author = req.body.author
            }
    
            await post.save()
            res.send(post)
        } catch {
            res.status(404)
            res.send({ error: "Post doesn't exist!" })
        }
    };

    exports.deleteBlog  = async (req, res) => {
            try {
                await Post.deleteOne({ _id: req.params.id })
                res.status(204).send()
            } catch {
                res.status(404)
                res.send({ error: "Post doesn't exist!" })
            }
        };

exports.SaveComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { content} = req.body;
        const postId = req.params.id;

        const comment = new Comment({
            
            postId, user: userId, content,
        });

        await comment.save();

        res.status(201).json(comment);
    } catch (error) {

            res.status(404)
            res.send({ error: "Post doesn't exist!" })
    }
};


exports.likeBlog = async (req, res) => {
    // try {
        const userId = req.user._id; 
        const postId = req.params.id; 
        const Liked_before = await Likes.findOne({ postId: postId, user: userId});

        if (Liked_before) {
            await Likes.deleteOne({ _id: Liked_before._id });
            res.status(200).json({ message: 'Like removed' });
        } else {
            const newLike = new Likes({ postId, user: userId});
            await newLike.save();
            res.status(201).json({ message: 'Like added', like: newLike })
        }
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Server error' });
    // }
};

exports.CountLikes = async (req, res) => {
    try {
        const postId = req.params.id; 
        const likeCount = await Likes.countDocuments({ postId: postId });
        res.status(200).json({ likeCount });
    } catch (error) {
        res.status(404)
        res.send({  error: 'Post not found'})
    }
};

exports.getAllLikesAndUsers = async (req, res) => {
    // try {
        const postId = req.params.id; 
        
        const likes = await Likes.find({ postId: postId }).populate('user', 'name email');

        // if (!likes) {
        //     return res.status(404).json({ message: 'No likes found for this post' });
        // }

        res.status(200).json({ likes });
    // } catch (error) {
    //     // console.error(error);
    //     res.status(500).json({ message: 'Server error' });
    // }
};

exports.GetComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        // const comments = await Comment.find({ postId: postId });
        const comments = await Comment.find({ postId: postId }).populate('user', 'email');
        res.status(200).json(comments);
    } catch (error) {
        res.status(404)
        res.send({  message: 'Post not found'})
    }
};

exports.CountLikesAndComments = async (req, res) => {
    try {
        const totalLikes = await Like.countDocuments();

        const totalComments = await Comment.countDocuments();

        res.status(200).json({
            totalLikes,
            totalComments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};