import express from 'express';
import { addReaction, removeReaction, getReactionsByPost } from '../controllers/reaction.controller.js';

const router = express.Router();

// POST /api/reaction/:postId  { userId, type }
router.post('/:postId', addReaction);

// DELETE /api/reaction/:postId  { userId }
router.delete('/:postId', removeReaction);

// GET /api/reaction/:postId
router.get('/:postId', getReactionsByPost);

export default router;
