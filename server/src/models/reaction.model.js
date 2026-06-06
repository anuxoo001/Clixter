import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], default: 'like' },
  },
  { timestamps: true }
);

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
