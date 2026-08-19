import { useState, useEffect } from "react";
import { Dialog, Button, IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import defaultLogo from "../../../assets/images/defaultlogo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../postSlice";
import { setAuthUser } from "../../auth/authSlice";
import { toast } from "sonner";
import apiClient from "../../../services/apiClient";
import { isVideoUrl } from "../../../utils/media";
import Linkify from "../../../components/common/Linkify";

const reactionEmojis = ["❤️", "😂", "😮", "😢", "👏"];

const timeAgo = (ts) => {
  if (!ts) return "";
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export default function PostDetailDialog({ post, open, handleClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);

  const [comments, setComments] = useState(post?.comments || []);
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(post?.likes || []);
  const [bookmarked, setBookmarked] = useState(
    user?.bookmarks?.includes(post?._id)
  );

  useEffect(() => {
    setComments(post?.comments || []);
    setLikes(post?.likes || []);
    setBookmarked(user?.bookmarks?.includes(post?._id));
  }, [post]);

  const liked = likes.some((id) => id?.toString?.() === user?.id?.toString?.());

  const syncPosts = (updater) => {
    dispatch(
      setPosts(posts.map((p) => (p._id === post._id ? updater(p) : p)))
    );
  };

  const likeHandler = async () => {
    try {
      const res = await apiClient.get(`/api/post/${post._id}/likeordislike`);
      if (res.data.success) {
        const newLikes = res.data.liked
          ? [...likes, user.id]
          : likes.filter((id) => id !== user.id);
        setLikes(newLikes);
        syncPosts((p) => ({ ...p, likes: newLikes }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await apiClient.get(`/api/post/${post._id}/bookmark`);
      if (res.data.success) {
        const current = user?.bookmarks || [];
        const already = current.includes(post._id);
        const updated = already
          ? current.filter((id) => id !== post._id)
          : [...current, post._id];
        setBookmarked(!already);
        dispatch(setAuthUser({ ...user, bookmarks: updated }));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async (e) => {
    e?.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await apiClient.post(`/api/post/${post._id}/addcomment`, {
        commentText,
      });
      if (res.data.success) {
        const updated = [...comments, res.data.comment];
        setComments(updated);
        syncPosts((p) => ({ ...p, comments: updated }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCommentText("");
    }
  };

  const editComment = async (commentId, text) => {
    const newText = prompt("Edit comment", text);
    if (!newText || !newText.trim()) return;
    try {
      const res = await apiClient.patch(
        `/api/post/${post._id}/comment/${commentId}`,
        { commentText: newText }
      );
      if (res.data.success) {
        const updated = comments.map((c) =>
          c._id === commentId ? { ...c, text: newText } : c
        );
        setComments(updated);
        syncPosts((p) => ({ ...p, comments: updated }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await apiClient.delete(
        `/api/post/${post._id}/comment/${commentId}`
      );
      if (res.data.success) {
        const updated = comments.filter((c) => c._id !== commentId);
        setComments(updated);
        syncPosts((p) => ({ ...p, comments: updated }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ className: "h-[90vh] rounded-lg overflow-hidden" }}
    >
      <div className="flex h-full w-full bg-white dark:bg-slate-900">
        {/* Left - media */}
        <div className="w-1/2 bg-black flex items-center justify-center overflow-hidden">
          {isVideoUrl(post?.media) ? (
            <video
              src={post?.media}
              controls
              muted
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              src={post?.media}
              alt="Post"
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {/* Right - details */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between gap-3">
            <div
              onClick={() => {
                const authorId = post?.author?._id;
                if (authorId) {
                  handleClose();
                  navigate(`/${authorId}/profile`);
                }
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={post?.author?.profilePicture?.link || defaultLogo}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {post?.author?.userName}
                </p>
                <p className="text-xs text-slate-500">{timeAgo(post?.createdAt)}</p>
              </div>
            </div>
            <IconButton onClick={handleClose}>
              <CloseIcon className="text-slate-500" />
            </IconButton>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {post?.caption && (
              <div className="flex items-start gap-3">
                <img
                  src={post?.author?.profilePicture?.link || defaultLogo}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <p className="text-sm text-slate-800 dark:text-slate-100">
                  <span className="font-semibold mr-1">{post.author.userName}</span>
                  <Linkify text={post.caption} />
                </p>
              </div>
            )}

            {comments.map((comment) => {
              const commentId = comment?._id;
              const isMyComment =
                user?.id &&
                comment?.author?._id &&
                comment.author._id.toString() === user.id.toString();

              return (
                <div key={commentId || Math.random()}>
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.author?.profilePicture?.link || defaultLogo}
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 dark:text-slate-100">
                        <span className="font-semibold mr-1">
                          {comment.author?.userName}
                        </span>
                        <Linkify text={comment.text} />
                      </p>

                      {isMyComment && (
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => editComment(commentId, comment.text)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            color="error"
                            onClick={() => deleteComment(commentId)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {reactionEmojis.map((emoji) => {
                          const reaction = comment?.reactions?.find(
                            (r) => r.emoji === emoji
                          );
                          const users = reaction?.users || [];
                          const count = users.length;
                          const reactedByMe = users.some(
                            (id) => id === user?.id || id?._id === user?.id
                          );
                          return (
                            <button
                              key={emoji}
                              onClick={async () => {
                                if (!commentId) return;
                                try {
                                  const res = await apiClient.post(
                                    `/api/post/comment/${commentId}/react`,
                                    { emoji }
                                  );
                                  if (res.data.success) {
                                    const updated = comments.map((c) =>
                                      c._id === commentId
                                        ? { ...c, reactions: res.data.reactions }
                                        : c
                                    );
                                    setComments(updated);
                                    syncPosts((p) => ({ ...p, comments: updated }));
                                  }
                                } catch (e) {
                                  console.log(e);
                                }
                              }}
                              className={`text-xs px-2 py-1 rounded-full border transition ${
                                reactedByMe
                                  ? "bg-red-100 border-red-400"
                                  : "border-zinc-700 bg-transparent hover:bg-zinc-800/40"
                              }`}
                              title="React"
                            >
                              <span className="text-base">{emoji}</span>
                              <span className="ml-1 text-[11px] opacity-80">
                                {count || ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 dark:border-white/10 p-3 space-y-2">
            <div className="flex items-center gap-3">
              {liked ? (
                <FavoriteIcon
                  onClick={likeHandler}
                  sx={{ fontSize: 28, color: "#ed4956" }}
                  className="cursor-pointer"
                />
              ) : (
                <FavoriteBorderIcon
                  onClick={likeHandler}
                  sx={{ fontSize: 28 }}
                  className="cursor-pointer text-slate-900 dark:text-white"
                />
              )}
              <IconButton onClick={bookmarkHandler}>
                {bookmarked ? (
                  <TurnedInIcon sx={{ fontSize: 26 }} className="text-slate-900 dark:text-white" />
                ) : (
                  <TurnedInNotIcon sx={{ fontSize: 26 }} className="text-slate-900 dark:text-white" />
                )}
              </IconButton>
              <span className="text-sm font-semibold text-slate-900 dark:text-white ml-auto">
                {likes.length} likes
              </span>
            </div>

            <form
              onSubmit={commentHandler}
              className="flex items-center gap-2 border-t border-gray-200 dark:border-white/10 pt-2"
            >
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                type="text"
                placeholder="Add a comment..."
                className="flex-1 outline-none text-sm px-2 bg-transparent text-slate-900 dark:text-white"
              />
              <Button onClick={commentHandler} variant="text" size="small">
                Post
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}