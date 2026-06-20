import Reaction from '../models/reaction.model.js';

export const addReaction = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId, type } = req.body;
    if (!postId || !userId) return res.status(400).json({ message: 'postId and userId are required' });

    // If same reaction from same user exists, update type; otherwise create
    let reaction = await Reaction.findOne({ postId, userId });
    if (reaction) {
      reaction.type = type || reaction.type;
      await reaction.save();
      return res.status(200).json({ message: 'Reaction updated', reaction });
    }

    reaction = new Reaction({ postId, userId, type });
    await reaction.save();
    return res.status(201).json({ message: 'Reaction added', reaction });
  } catch (err) {
    next(err);
  }
};

export const removeReaction = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    if (!postId || !userId) return res.status(400).json({ message: 'postId and userId are required' });
    const result = await Reaction.findOneAndDelete({ postId, userId });
    if (!result) return res.status(404).json({ message: 'Reaction not found' });
    return res.status(200).json({ message: 'Reaction removed' });
  } catch (err) {
    next(err);
  }
};

export const getReactionsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const reactions = await Reaction.find({ postId }).lean();
    return res.status(200).json({ reactions });
  } catch (err) {
    next(err);
  }
};
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import { getSocketId, io } from "../config/socket.js";

const normalizeEmoji = (emoji) => (typeof emoji === 'string' ? emoji.trim() : '');

const toggleReactionOnArray = ({ usersField, userId, newReaction }) => {
  // usersField: array of ObjectId
  const users = newReaction.users;
  const exists = users.some((id) => id.toString() === userId);
  if (exists) {
    return {
      ...newReaction,
      users: users.filter((id) => id.toString() !== userId),
      changed: true,
      removed: true,
    };
  }
  return {
    ...newReaction,
    users: [...users, userId],
    changed: true,
    removed: false,
  };
};

export const reactToPost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;
    const { emoji } = req.body;

    const safeEmoji = normalizeEmoji(emoji);
    if (!safeEmoji) {
      return res.status(400).json({ success: false, message: 'emoji is required' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found!' });

    // reactions: [{ emoji, users: [ObjectId] }]
    const existing = post.reactions.find((r) => r.emoji === safeEmoji);
    if (!existing) {
      post.reactions.push({ emoji: safeEmoji, users: [userId] });
    } else {
      const reacted = existing.users.some((id) => id.toString() === userId);
      if (reacted) {
        existing.users = existing.users.filter((id) => id.toString() !== userId);
        if (existing.users.length === 0) {
          post.reactions = post.reactions.filter((r) => r.emoji !== safeEmoji);
        }
      } else {
        existing.users.push(userId);
      }
    }

    await post.save();

    // broadcast updated reactions so clients can refresh UI
    io.emit('postReactionsUpdated', { postId, reactions: post.reactions });

    const authorId = post.author.toString();

    // Notify post author (if not self)
    if (authorId !== userId) {
      const user = await User.findById(userId).select('userName profilePicture');
      const notification = {
        type: 'reaction',
        userId,
        userDetails: user,
        postId,
        emoji: safeEmoji,
        message: 'Reacted to your post.',
      };
      const postOwnerSocketId = getSocketId(authorId);
      console.log('DEBUG notifyPostOwner', { authorId, postOwnerSocketId, ioToCalls: io.to.mock?.calls?.length });
      if (postOwnerSocketId) io.to(postOwnerSocketId).emit('reactionNotification', notification);
    }

    return res.status(200).json({
      success: true,
      message: 'Reaction updated',
      reactions: post.reactions,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const reactToComment = async (req, res) => {
  try {
    const userId = req.id;
    const commentId = req.params.commentId;
    const { emoji } = req.body;

    const safeEmoji = normalizeEmoji(emoji);
    if (!safeEmoji) {
      return res.status(400).json({ success: false, message: 'emoji is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found!' });

    const existing = comment.reactions.find((r) => r.emoji === safeEmoji);
    if (!existing) {
      comment.reactions.push({ emoji: safeEmoji, users: [userId] });
    } else {
      const reacted = existing.users.some((id) => id.toString() === userId);
      if (reacted) {
        existing.users = existing.users.filter((id) => id.toString() !== userId);
        if (existing.users.length === 0) {
          comment.reactions = comment.reactions.filter((r) => r.emoji !== safeEmoji);
        }
      } else {
        existing.users.push(userId);
      }
    }

    await comment.save();

    // broadcast updated comment reactions
    io.emit('commentReactionsUpdated', { commentId, reactions: comment.reactions });

    const authorId = comment.author.toString();
    if (authorId !== userId) {
      const user = await User.findById(userId).select('userName profilePicture');
      const notification = {
        type: 'reaction',
        userId,
        userDetails: user,
        commentId,
        emoji: safeEmoji,
        message: 'Reacted to your comment.',
      };
      const ownerSocketId = getSocketId(authorId);
      if (ownerSocketId) io.to(ownerSocketId).emit('reactionNotification', notification);
    }

    return res.status(200).json({
      success: true,
      message: 'Reaction updated',
      reactions: comment.reactions,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

