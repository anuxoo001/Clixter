import express from "express";
import { addCommentOnPost, addPost, bookmarkToPost, deletePost, getAllPost, getCommentOfPost, getUserPost, likeDislikeToPost } from "../controllers/post.controller.js";
import verifyToken from "../middlewares/verifyToken.js"
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post('/addpost' , verifyToken, upload.single('media') , addPost);
router.delete('/delete/:id' , verifyToken, deletePost);
router.get('/getallposts' , verifyToken, getAllPost);
router.get('/getuserspost' , verifyToken, getUserPost);
router.get('/:id/likeordislike' , verifyToken, likeDislikeToPost);
router.post('/:id/addcomment' , verifyToken, addCommentOnPost);
router.get('/:id/getallcomment' , verifyToken, getCommentOfPost);
router.get('/:id/bookmark' , verifyToken, bookmarkToPost);


export default router