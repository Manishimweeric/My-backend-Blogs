const mongoose = require("mongoose")
const blogLike = require("./Blogs_likes");
const blogComment= require("./Blogs_comments");
    
const schema = mongoose.Schema({
        title : {
                type: String,
                required: true,

        },
        content : {
                type: String,
                required: true,
    },
    image: {
        type: String,
        default: '' 
    },
    public_id: {
        type: String,
        default: '' 
    
    }, date : {

        type: Date,
        default: Date.now,        
    },
    author : {
        type: String,
    },
    likesCount: {
        type: Number,
        default: 0
    }
}
)
    
    module.exports = mongoose.model("Blog", schema)