import express from "express"
import { registerUser, loginUser , logoutUser, getProfile, editProfile, getSuggestions, followUnfollow, searchProfile, addToMessageInbox } from '../controllers/user.controller.js';
import verifyToken from "../middlewares/verifyToken.js"
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/:id/searchprofile', verifyToken, searchProfile)
router.get('/:id/profile', verifyToken, getProfile);
router.post('/profile/edit' , verifyToken , upload.single('profilePhoto'), editProfile)
router.get('/suggestions' , verifyToken,  getSuggestions)
router.get('/:id/followunfollow' , verifyToken, followUnfollow)
router.get('/:id/addtomessageinbox' , verifyToken, addToMessageInbox)

router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
  });
});
router.get('/myid' ,verifyToken ,  (req , res) => {
  const id = req.id
  return res.status(201).json({id : id})
})
export default router