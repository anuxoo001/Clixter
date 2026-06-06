import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Comment from "../models/comment.model.js";
import { getSocketId , io } from "../config/socket.js";


export const addPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const media = req.file;
        const authorId = req.id;

        if (!media) return res.status(400).json({ success: false, message: "Media required!" });

        const post = await Post.create({
            author: authorId,
            caption,
            media: media.path
        });

        const user = await User.findById(authorId);
        if (!user) return res.status(400).json({ success: false, message: "User not registered!" });

        user.posts.push(post._id);
        await user.save();

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({ success: true, message: 'Post created successfully.' , post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const authorId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }

        if (post.author.toString() !== authorId) {
            return res.status(404).json({success: false, message: 'Unauthorized!'})
        }

        //delete post by id
        await Post.findByIdAndDelete(postId)

        //delete post-id from user
        let user = await User.findById(authorId)
        user.posts = user.posts.filter(id => id.toString() !== postId)
        await user.save()

        //delete comments of the post
        await Comment.deleteMany({post:postId})
        
        return res.status(201).json({success: true, message: 'Post deleted Successfully.'})
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1})
        .populate({path: 'author' , select: 'userName , profilePicture'})
        .populate({path: 'comments' , sort:{createdAt: -1} , populate: {path: 'author' , select: 'userName  profilePicture'}})

        return res.status(201).json({ success: true,  posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getUserPost = async (req , res) =>{
    try {
        const authorId = req.id;
        const posts = await Post.find({author: authorId}).sort({createdAt: -1}).populate({
            path: 'author',
            select: 'userName, profilePicture'
        }).populate({
            path: 'comments',
            sort: {createdAt},
            populate: {
                path: 'author',
                select: 'userName, profilePicture'
            }
        })
        return res.status(201).json({ success: true,  posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const likeDislikeToPost = async (req, res) => {
    try {
        const authorId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }

        const isLiked = post.likes.includes(authorId);

        if (isLiked) {
            await post.updateOne({ $pull: { likes: authorId } });
            await post.save();
            const user = await User.findById(authorId).select('userName profilePicture')
            const postOnwerId = post.author.toString()
            if(postOnwerId !== authorId){
                const notification = {
                    type: 'dislike',
                    userId: authorId,
                    userDetails: user,
                    postId,
                    message: 'Your post was liked.'
                }
                const postOnwerSocktId = getSocketId(postOnwerId)
                if(postOnwerSocktId){
                    io.to(postOnwerSocktId).emit('likeNotification', notification)
                }
            }
            return res.status(200).json({ success: true, message: 'Post Disliked.', liked: false });
        } else {
            await post.updateOne({ $addToSet: { likes: authorId } });
            await post.save();
            const user = await User.findById(authorId).select('userName profilePicture')
            const postOnwerId = post.author.toString()
            if(postOnwerId !== authorId){
                const notification = {
                    type: 'like',
                    userId: authorId,
                    userDetails: user,
                    postId,
                    message: 'Liked your post.'
                }
                const postOnwerSocktId = getSocketId(postOnwerId)
                if(postOnwerSocktId){
                    io.to(postOnwerSocktId).emit('likeNotification', notification)
                }
            }
           
            return res.status(201).json({ success: true, message: 'Post Liked.', liked: true });
        }
        

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const addCommentOnPost = async (req, res) => {
    try {
        const authorId = req.id;
        const postId = req.params.id;
        const {commentText} = req.body;

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }
        if (!commentText) {
            return res.status(404).json({ success: false, message: 'Please type comment!' });
        }
        
        const comment = await Comment.create({
            author: authorId,
            post: postId,
            text: commentText
        })
        await comment.populate({
            path: 'author',
            select: 'userName profilePicture'
        })

        post.comments.push(comment._id)
        await post.save()

        return res.status(201).json({success: true, comment , message: 'Comment Successfully.'})
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getCommentOfPost = async (req, res) => {
    try {
        const postId = req.params.id;
        
        const comments = await Comment.find({post: postId}).populate({
            path: 'author',
            select: 'userName, profilePicture'
        })
        
        if (!comments) return res.status(401).json({success: false, message: 'No comments on this Post!'})

        return res.status(201).json({success: true, comments})
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const editCommentOnPost = async (req, res) => {
    try {
        const userId = req.id;
        const { postId, commentId } = req.params;
        const { commentText } = req.body;

        if (!commentText) {
            return res.status(400).json({ success: false, message: 'Please type comment!' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found!' });

        if (comment.post.toString() !== postId) {
            return res.status(404).json({ success: false, message: 'Post not found for this comment!' });
        }

        if (comment.author.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized!' });
        }

        comment.text = commentText;
        await comment.save();

        await comment.populate({ path: 'author', select: 'userName profilePicture' });

        return res.status(200).json({ success: true, message: 'Comment updated successfully.', comment });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteCommentOnPost = async (req, res) => {
    try {
        const userId = req.id;
        const { postId, commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found!' });

        if (comment.post.toString() !== postId) {
            return res.status(404).json({ success: false, message: 'Post not found for this comment!' });
        }

        if (comment.author.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized!' });
        }

        await Comment.findByIdAndDelete(commentId);
        await Post.updateOne({ _id: postId }, { $pull: { comments: commentId } });

        return res.status(200).json({ success: true, message: 'Comment deleted successfully.', commentId });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const bookmarkToPost = async (req, res) => {
    try {
        const authorId = req.id;
        const postId = req.params.id;

        const user = await User.findById(authorId)
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }

        const isBookmarked = user.bookmarks.includes(postId);

        if (isBookmarked) {
            await user.updateOne({ $pull: { bookmarks: postId } });
            await user.save();
            return res.status(200).json({ success: true, message: 'Removed from Bookmarks.' });
        } else {
            await user.updateOne({ $addToSet: { bookmarks: postId } });
            await user.save();
            return res.status(201).json({ success: true, message: 'Bookmarked successfully.' });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

