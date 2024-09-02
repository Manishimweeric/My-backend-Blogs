const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
   
    date: {
        type: Date,
        default: Date.now
    }
});

const blogComment = mongoose.model("blogComment", commentSchema);

module.exports = blogComment;
