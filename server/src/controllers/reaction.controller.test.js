import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../models/post.model.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));
vi.mock('../models/user.model.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));
vi.mock('../models/comment.model.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));
vi.mock('../config/socket.js', () => ({
  getSocketId: vi.fn(),
  io: {
    emit: vi.fn(),
    to: vi.fn(() => ({ emit: vi.fn() })),
  },
}));

const Post = (await import('../models/post.model.js')).default;
const User = (await import('../models/user.model.js')).default;
const Comment = (await import('../models/comment.model.js')).default;
const { getSocketId, io } = await import('../config/socket.js');
const { reactToPost, reactToComment } = await import('./reaction.controller.js');

const createResponse = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe('reaction.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when post does not exist', async () => {
    Post.findById.mockResolvedValue(null);
    const req = { id: 'user-1', params: { id: 'post-1' }, body: { emoji: '❤️' } };
    const res = createResponse();

    await reactToPost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Post not found!' });
  });

  it('adds a reaction when none exists', async () => {
    const save = vi.fn();
    const post = {
      _id: 'post-1',
      author: 'author-1',
      reactions: [],
      save,
    };
    Post.findById.mockResolvedValue(post);
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ userName: 'TestUser', profilePicture: 'pic' }),
    });
    getSocketId.mockReturnValue('socket-1');

    const req = { id: 'user-1', params: { id: 'post-1' }, body: { emoji: '❤️' } };
    const res = createResponse();

    await reactToPost(req, res);

    expect(save).toHaveBeenCalled();
    expect(post.reactions).toEqual([{ emoji: '❤️', users: ['user-1'] }]);
    expect(io.to).toHaveBeenCalledWith('socket-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Reaction updated', reactions: post.reactions });
  });

  it('toggles emoji removal when user has already reacted', async () => {
    const save = vi.fn();
    const post = {
      _id: 'post-1',
      author: 'author-1',
      reactions: [{ emoji: '❤️', users: ['user-1'] }],
      save,
    };
    Post.findById.mockResolvedValue(post);
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ userName: 'TestUser', profilePicture: 'pic' }),
    });
    getSocketId.mockReturnValue('socket-1');

    const req = { id: 'user-1', params: { id: 'post-1' }, body: { emoji: '❤️' } };
    const res = createResponse();

    await reactToPost(req, res);

    expect(save).toHaveBeenCalled();
    expect(post.reactions).toEqual([]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Reaction updated', reactions: post.reactions });
  });

  it('returns 404 when comment does not exist', async () => {
    Comment.findById.mockResolvedValue(null);
    const req = { id: 'user-1', params: { commentId: 'comment-1' }, body: { emoji: '😂' } };
    const res = createResponse();

    await reactToComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Comment not found!' });
  });

  it('adds a reaction to a comment', async () => {
    const save = vi.fn();
    const comment = {
      _id: 'comment-1',
      author: 'author-1',
      reactions: [],
      save,
    };
    Comment.findById.mockResolvedValue(comment);
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ userName: 'TestUser', profilePicture: 'pic' }),
    });
    getSocketId.mockReturnValue('socket-1');

    const req = { id: 'user-1', params: { commentId: 'comment-1' }, body: { emoji: '😂' } };
    const res = createResponse();

    await reactToComment(req, res);

    expect(save).toHaveBeenCalled();
    expect(comment.reactions).toEqual([{ emoji: '😂', users: ['user-1'] }]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Reaction updated', reactions: comment.reactions });
  });
});

