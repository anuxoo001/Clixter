import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Post from '../models/post.model.js';

dotenv.config({ path: './server/.env' });

const postId = process.argv[2];
if (!postId) {
  console.error('Usage: node pollPublish.js <postId>');
  process.exit(1);
}

const run = async () => {
  await connectDB();
  let attempts = 0;
  const maxAttempts = 8; // poll for ~2 minutes
  const interval = 15 * 1000;
  const timer = setInterval(async () => {
    attempts++;
    const post = await Post.findById(postId).lean();
    if (!post) {
      console.error('Post not found', postId);
      clearInterval(timer);
      process.exit(1);
    }
    console.log(new Date().toISOString(), 'Attempt', attempts, 'published=', post.published, 'publishedAt=', post.publishedAt);
    if (post.published) {
      console.log('Post published — DONE');
      clearInterval(timer);
      process.exit(0);
    }
    if (attempts >= maxAttempts) {
      console.log('Timed out waiting for publish');
      clearInterval(timer);
      process.exit(2);
    }
  }, interval);
};

run();
