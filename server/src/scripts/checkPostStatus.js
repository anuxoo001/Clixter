import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Post from '../models/post.model.js';

dotenv.config({ path: './server/.env' });

const postId = process.argv[2];
if (!postId) {
  console.error('Usage: node checkPostStatus.js <postId>');
  process.exit(1);
}

const run = async () => {
  await connectDB();
  const post = await Post.findById(postId).lean();
  if (!post) {
    console.error('Post not found', postId);
    process.exit(1);
  }
  console.log('Post:', { id: post._id.toString(), isScheduled: post.isScheduled, scheduledAt: post.scheduledAt, published: post.published, publishedAt: post.publishedAt });
  process.exit(0);
};

run();
