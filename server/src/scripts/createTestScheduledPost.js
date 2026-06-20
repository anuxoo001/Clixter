import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';

// load env from server/.env when running from workspace root
dotenv.config({ path: './server/.env' });

const run = async () => {
  try {
    await connectDB();
    // replace with an existing user id from logs or DB
    const userId = '6a1b2526e22113bf1f7fb660';
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      process.exit(1);
    }

    const scheduledAt = new Date(Date.now() + 60 * 1000); // 1 minute from now
    const post = await Post.create({
      author: user._id,
      media: 'tests/placeholder.jpg',
      caption: 'Test scheduled post',
      isScheduled: true,
      scheduledAt,
      published: false
    });

    user.posts.push(post._id);
    await user.save();

    console.log('Scheduled post created:', post._id.toString(), 'scheduledAt:', scheduledAt);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
