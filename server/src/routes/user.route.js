import express from "express"
import User from "../models/user.model.js"
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

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.id)
      .select('-password')
      .populate({ path: 'posts', options: { sort: { createdAt: -1 } } })
      .populate({ path: 'bookmarks' })
      .populate({ path: 'following', select: 'userName fullName profilePicture' })
      .populate({ path: 'followers', select: 'userName fullName profilePicture' });

    if (!user) {
      return res.status(401).json({ success: false, message: "User doesn't exist!" });
    }

    res.status(200).json({
      success: true,
      user: { ...user.toObject(), id: user._id.toString() },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
});
router.get('/myid' ,verifyToken ,  (req , res) => {
  const id = req.id
  return res.status(201).json({id : id})
})
export default router