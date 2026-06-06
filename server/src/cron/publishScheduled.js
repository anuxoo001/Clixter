import Post from '../models/post.model.js';

export const startPublishScheduler = (intervalMs = 60_000) => {
  // Run immediately and then every interval
  const publishOnce = async () => {
    try {
      const now = new Date();
      const due = await Post.find({ isScheduled: true, published: false, scheduledAt: { $lte: now } });
      if (due && due.length) {
        for (const post of due) {
          post.published = true;
          post.publishedAt = new Date();
          post.isScheduled = false;
          await post.save();
        }
        console.log(`Published ${due.length} scheduled post(s)`);
      }
    } catch (err) {
      console.error('Error publishing scheduled posts:', err);
    }
  };

  publishOnce();
  return setInterval(publishOnce, intervalMs);
};

export default startPublishScheduler;
