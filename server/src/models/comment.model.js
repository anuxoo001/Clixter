import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId , ref: 'User' , required: true},
    post: {type: mongoose.Schema.Types.ObjectId , ref: 'Post' , required: true},
    text: {type: String , required: true},
    reactions: [
        {
            emoji: { type: String, required: true },
            users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        }
    ]
}, {timestamps: true})

const Comment = mongoose.model('Comment', commentSchema);

export default Comment

