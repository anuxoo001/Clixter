import express from "express";
import { addCommentOnPost, addPost, bookmarkToPost, deletePost, editCommentOnPost, editPostCaption, getAllPost, getCommentOfPost, getPostLikes, getUserPost, likeDislikeToPost, deleteCommentOnPost, schedulePost } from "../controllers/post.controller.js";
import { reactToComment, reactToPost } from "../controllers/reaction.controller.js";
import verifyToken from "../middlewares/verifyToken.js"
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post('/addpost' , verifyToken, upload.single('media') , addPost);
router.post('/schedule' , verifyToken, upload.single('media') , schedulePost);
router.delete('/delete/:id' , verifyToken, deletePost);
router.get('/getallposts' , verifyToken, getAllPost);
router.get('/getuserspost' , verifyToken, getUserPost);
router.get('/:id/likes' , verifyToken, getPostLikes);
router.patch('/:id' , verifyToken, editPostCaption);
router.get('/:id/likeordislike' , verifyToken, likeDislikeToPost);
router.post('/:id/react' , verifyToken, reactToPost);
router.post('/comment/:commentId/react', verifyToken, reactToComment);
router.post('/:id/addcomment' , verifyToken, addCommentOnPost);
router.patch('/:postId/comment/:commentId' , verifyToken, editCommentOnPost);
router.delete('/:postId/comment/:commentId' , verifyToken, deleteCommentOnPost);
router.get('/:id/getallcomment' , verifyToken, getCommentOfPost);
router.get('/:id/bookmark' , verifyToken, bookmarkToPost);

export default router

