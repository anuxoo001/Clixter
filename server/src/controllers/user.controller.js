import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getSocketId , io } from "../config/socket.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, userName, email, password } = req.body;
    if (!fullName || !userName || !email || !password) {
      return res.status(401).json({
        success: false,
        message: "Something is missing, please check!",
      });
    }
    const isExistUser = await User.findOne({ email });
    if (isExistUser) {
      return res.status(401).json({
        success: false,
        message: "User is Already Existing... Try with new Email!",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await User.create({ fullName, userName, email, password: hashPassword });
    return res.status(201).json({
      success: true,
      message: "Account created Successfully.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Something is missing, please check!",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Email!",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password!",
      });
    }
    const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const populatedPost = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId)
        if (post.author.equals(user._id)) {
          return post
        }
        return null
      })
    )
    const populatedInbox = await Promise.all(
      user.messageInbox.map(async (userId) => {
        const user = await User.findById(userId)
        return user
      })
    )
    const auther = {
      id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      gender: user.gender,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPost,
      bookmarks: user.bookmarks,
      messageInbox: populatedInbox
    };
    const cookieOptions = {
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.sameSite = "none";
      cookieOptions.secure = true;
    } else {
      cookieOptions.sameSite = "lax";
      cookieOptions.secure = false;
    }

    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        message: `Welcome back ${user.userName}`,
        auther,
      });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.status(201).clearCookie("token").json({
      success: true,
      message: "Logged out Successfully.",
    });
  } catch (error) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const searchProfile = async (req, res) => {
  try {
    const userName = req.params.id;
    const users = await User.find({
      userName: { $regex: userName, $options: 'i' }
    }).select('-password');
    if(!users) return res.status(401).json({success: false, message: 'User not found!'})

    return res.status(201).json({success: true, users})

  } catch (error) {
    res.status(401).json({ success: false, message: err.message });
  }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password')
      .populate({ path: 'posts', options: { sort: { createdAt: -1 } } }) 
      .populate({ path: 'bookmarks' })
      .populate({ path: 'following', select: 'userName fullName profilePicture' }) 
      .populate({ path: 'followers', select: 'userName fullName profilePicture' });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User doesn't exist!" });
    }
    return res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id ;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    // Allow updating bio/gender without uploading a new profile photo.
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) {
      user.profilePicture = {
        link: profilePicture.path,
        fileName: profilePicture.filename,
      };
    }


    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });


  } catch (error) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.id).select('following');
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const excludedIds = [...currentUser.following.map(id => id.toString()), req.id];

    const suggestionUsers = await User.find({ _id: { $nin: excludedIds } }).select('-password');

    return res.status(200).json({
      success: true,
      suggestionUsers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const followUnfollow = async (req, res) => {
  try {
    const fromId = req.id;
    const toId = req.params.id;

    if (fromId === toId) {
      return res.status(401).json({
        success: false,
        message: 'Unable to follow yourself!'
      });
    }

    const user = await User.findById(fromId).select('userName profilePicture following');
    const targetUser = await User.findById(toId).select('userName profilePicture');

    if (!user || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = user.following.includes(toId);

    const targetUserSocketId = getSocketId(toId);

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: fromId }, { $pull: { following: toId } }),
        User.updateOne({ _id: toId }, { $pull: { followers: fromId } })
      ]);

      if (targetUserSocketId) {
        io.to(targetUserSocketId).emit('followNotification', {
          type: 'unfollow',
          userId: fromId,
          userDetails: user,
          message: `Unfollowed you.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Unfollowed'
      });
    } else {
      await Promise.all([
        User.updateOne({ _id: fromId }, { $push: { following: toId } }),
        User.updateOne({ _id: toId }, { $push: { followers: fromId } })
      ]);

      if (targetUserSocketId) {
        io.to(targetUserSocketId).emit('followNotification', {
          type: 'follow',
          userId: fromId,
          userDetails: user,
          message: `Started following you.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Following'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const addToMessageInbox = async (req, res) => {
  try {
    const authorId = req.id;
    const userId = req.params.id;

    const user = await User.findById(authorId)
    if(!user) return res.status(401).json({success: false, message: 'User not Found!'})

    await User.updateOne(
      { _id: authorId },
      { $addToSet: { messageInbox: userId } } 
    );
    const addedUser = await User.findById(userId).select("-password"); 

    res.status(201).json({ success: true, message: 'User added to inbox', addedUser });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// ADMIN/MAINTENANCE: delete N oldest users in database (and their posts/comments)
export const deleteOldestUsers = async (req, res) => {
  try {
    const countRaw = req.params.count;
    const count = Number(countRaw);

    if (!Number.isInteger(count) || count <= 0) {
      return res.status(400).json({ success: false, message: "Invalid count" });
    }

    const users = await User.find({})
      .sort({ createdAt: 1 })
      .limit(count);

    if (!users.length) {
      return res.status(200).json({ success: true, message: "No users found", deletedUsers: [] });
    }

    const userIds = users.map((u) => u._id);

    // Posts authored by those users
    const posts = await Post.find({ author: { $in: userIds } }).select('_id');
    const postIds = posts.map((p) => p._id);

    // Remove comments + posts
    if (postIds.length) {
      await User.updateMany({
        $pull: {
          posts: { $in: postIds },
          bookmarks: { $in: postIds },
        }
      });

      await Comment.deleteMany({ post: { $in: postIds } });
      await Post.deleteMany({ _id: { $in: postIds } });
    }

    // Remove references + delete users (best-effort)
    await User.updateMany({
      $pull: {
        followers: { $in: userIds },
        following: { $in: userIds },
        messageInbox: { $in: userIds },
      }
    });

    await User.deleteMany({ _id: { $in: userIds } });

    return res.status(200).json({
      success: true,
      message: `Deleted ${users.length} oldest users`,
      deletedUsers: userIds,
      deletedPosts: postIds,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
