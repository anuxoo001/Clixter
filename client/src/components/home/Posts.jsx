import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Button,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import DetailsIcon from '@mui/icons-material/Details';
import ShareIcon from '@mui/icons-material/Share';
import Avatar from "@mui/material/Avatar";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "../../features/posts/postSlice";
import CommentDialog from "../../features/comments/components/CommentDialog";
import { addSuggestionUser, removeSuggestionUser, setAuthUser } from "../../features/auth/authSlice";
import apiClient from "../../services/apiClient";
import { isVideoUrl } from "../../utils/media";
import Linkify from "../common/Linkify";
import LikesDialog from "../../features/posts/components/LikesDialog";

export default function Posts({ data }) {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const [openDialog, setOpenDialog] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [postLikes, setPostLikes] = useState(data?.likes?.length || 0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(data?.comments || []);
  const [showHeart, setShowHeart] = useState(false);
  const [postReactions, setPostReactions] = useState(data?.reactions || []);
  const [postLikeIds, setPostLikeIds] = useState(data?.likes || []);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [likesOpen, setLikesOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setComments(data.comments);
    }
  }, [data]);

  useEffect(() => {
    setPostReactions(data?.reactions || []);
  }, [data]);

  // Prevent crashes when feed data is still loading or contains null items/author
  if (!data || !data.author) {
    return (
      <div className="glass-card p-4">
        <p className="text-sm text-slate-400">Loading post...</p>
      </div>
    );
  }


  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} sec`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day`;
  };

  const deletePostHandler = async () => {
    try {
      const res = await apiClient.delete(`/api/post/delete/${data._id}`);
      if (res.data.success) {
        const updatedPosts = posts.filter((postItem) => postItem?._id !== data?._id);
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleCloseDialog();
    }
  };

  const editCaptionHandler = async () => {
    const newCaption = prompt("Edit caption", data.caption || "");
    if (newCaption === null) {
      handleCloseDialog();
      return;
    }
    try {
      const res = await apiClient.patch(`/api/post/${data._id}`, { caption: newCaption });
      if (res.data.success) {
        const updatedPosts = posts.map((post) =>
          post._id === data._id ? { ...post, caption: newCaption } : post
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleCloseDialog();
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const res = await apiClient.get(`/api/post/${data._id}/likeordislike`);
      if (res.data.success) {
        setPostLikes(res.data.liked ? postLikes + 1 : postLikes - 1);
        // update local like ids for instant UI feedback
        setPostLikeIds((prev) => {
          const myId = user?.id;
          const has = prev?.some((id) => id?.toString?.() === myId?.toString?.());
          if (res.data.liked && !has) return [...(prev || []), myId];
          if (!res.data.liked && has) return (prev || []).filter((id) => id?.toString?.() !== myId?.toString?.());
          return prev || [];
        });

        const updatedPosts = posts.map(post =>
          post._id === data._id
            ? {
                ...post,
                likes: res.data.liked
                  ? [...post.likes, user.id]
                  : post.likes.filter(id => id !== user.id),
              }
            : post
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await apiClient.post(`/api/post/${data?._id}/addcomment`, { commentText });
      if (res.data.success) {
        const updatedComments = [...comments, res.data.comment];
        setComments(updatedComments);
        const updatedPosts = posts.map(post =>
          post._id === data._id ? { ...post, comments: updatedComments } : post
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCommentText("");
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await apiClient.get(`/api/post/${data?._id}/bookmark`);
      if (res.data.success) {
        const postId = data._id;
        const currentBookmarks = user?.bookmarks || [];
        const alreadyBookmarked = currentBookmarks.includes(postId);
        const updatedBookmarks = alreadyBookmarked
          ? currentBookmarks.filter(id => id !== postId)
          : [...currentBookmarks, postId];

        dispatch(setAuthUser({
          ...user,
          bookmarks: updatedBookmarks,
        }));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const followUnfollowHandler = async () => {
    try {
      const targetUserId = data?.author?._id;
      if (!targetUserId) return;

      const res = await apiClient.get(`/api/user/${targetUserId}/followunfollow`);
      if (res.data.success) {
        const currentFollowing = user?.following || [];
        const alreadyFollowing = currentFollowing.includes(targetUserId);

        const updatedFollowing = alreadyFollowing
          ? currentFollowing.filter(id => id !== targetUserId)
          : [...currentFollowing, targetUserId];

        dispatch(setAuthUser({ ...user, following: updatedFollowing }));

        alreadyFollowing
          ? dispatch(addSuggestionUser(data.author))
          : dispatch(removeSuggestionUser(targetUserId));

        toast.success(res.data.message);
        handleCloseDialog()

      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDoubleClick = () => {
    if (!postLikeIds.includes(user?.id)) {
      likeOrDislikeHandler();
    }

    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1200);
  };

  const copyPostLink = async () => {
    try {
      const url = `${window.location.origin}/#/post/${data?._id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
      setShareDialogOpen(false);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = [
    {
      label: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(data?.caption || "Check this post")} ${encodeURIComponent(window.location.href)}`,
      bg: "bg-green-500",
    },
    {
      label: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      bg: "bg-blue-600",
    },
    {
      label: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(data?.caption || "Check this post")}&url=${encodeURIComponent(window.location.href)}`,
      bg: "bg-slate-900",
    },
  ];

  const isAuthor = user?.id === data?.author?._id;

  const visibleOptions = [
    { label: "Delete Post", danger: true, showFor: "author", onClick: deletePostHandler },
    { label: "Edit Caption", danger: false, showFor: "author", onClick: editCaptionHandler },
    // { label: "Report", danger: true, showFor: "user" },
    {
      label: user?.following?.includes(data?.author?._id) ? 'Unfollow' : 'Follow',
      danger: true,
      showFor: "user",
      onClick: followUnfollowHandler
    },

    // { label: "Share to...", showFor: "all" },
    // { label: "Copy link", showFor: "all" },
    { label: "About this account", showFor: "user", onClick: () => navigate(`${data?.author._id}/profile`) },
    { label: "Cancel", showFor: "all" },
  ].filter((item) => {
    if (item.showFor === "all") return true;
    if (item.showFor === "author") return isAuthor;
    if (item.showFor === "user") return !isAuthor;
    return false;
  });

  return (
    <div className="glass-card p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <div
          onClick={() => navigate(`${data.author?._id || ''}/profile`)}
          className="flex items-center gap-3 cursor-pointer"
        >

          <div className="w-10 h-10 rounded-full overflow-hidden">
            {data.author?.profilePicture?.link ? (
                <img
                    src={data.author?.profilePicture?.link}
                    alt={data.author?.userName}
                    className="w-10 h-10 rounded-full object-cover"
                />
                ) : (
                <Avatar
                    sx={{ bgcolor: "#3f51b5", width: 40, height: 40, fontSize: 16 }}
                >
                    {data.author.userName?.[0]?.toUpperCase() || "?"}
                </Avatar>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {data.author.userName}
              <span className="text-blue-400"> ✔</span>
              {isAuthor && <span className="ml-2 text-xs bg-gray-300/70 px-1 rounded">Author</span>}
            </p>
            <p className="text-xs text-gray-400">
              {formatTimeAgo(data.createdAt)} • Clixter
            </p>
          </div>
        </div>
        <IconButton onClick={handleOpenDialog}>
          <MoreHorizIcon className="text-slate-300" />
        </IconButton>
        <Dialog fullWidth
          maxWidth="xs"
          open={openDialog} 
          onClose={handleCloseDialog}>
          <DialogContent>
            <div className="flex flex-col divide-y divide-gray-200">
              {visibleOptions.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick || handleCloseDialog}
                  className={`py-3 text-sm ${item.danger ? "text-red-500 font-semibold" : "text-slate-100"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className="w-full h-[500px] rounded-md overflow-hidden relative group bg-black"
        onDoubleClick={handleDoubleClick}
      >
        {isVideoUrl(data.media) ? (
          <video
            src={data.media}
            controls
            loop
            muted={videoMuted}
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <img
            src={data.media}
            alt="post_media"
            className="w-full h-full object-contain"
          />
        )}
        {isVideoUrl(data.media) && (
          <button
            onClick={() => setVideoMuted((m) => !m)}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
            aria-label="Toggle sound"
          >
            {videoMuted ? "🔇" : "🔊"}
          </button>
        )}
        {showHeart && (
          <FavoriteIcon
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1)',
              color: 'white',
              fontSize: 90,
              opacity: 0,
              animation: 'pop 1.2s ease-in-out',
              '@keyframes pop': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 0,
                },
                '25%': {
                  transform: 'translate(-50%, -50%) scale(1.3)',
                  opacity: 1,
                },
                '75%': {
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(0.8)',
                  opacity: 0,
                },
              },
            }}
          />
        )}
      </div>
      <div className="pt-2 px-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {postLikeIds?.includes(user?.id) ?
              <FavoriteIcon onClick={likeOrDislikeHandler} sx={{ fontSize: "30px", color: "#ed4956" }} className="cursor-pointer" />
              :
              <FavoriteBorderIcon onClick={likeOrDislikeHandler} sx={{ fontSize: "30px" }} className="cursor-pointer text-slate-100" />}
            <ChatBubbleOutlineIcon
              onClick={() => {
                dispatch(setSelectedPost(data));
                setCommentDialogOpen(true);
              }}
              sx={{ fontSize: "27px" }}
              className="cursor-pointer text-slate-100"
            />
            <ShareIcon
              onClick={() => setShareDialogOpen(true)}
              sx={{ fontSize: "26px" }}
              className="cursor-pointer text-slate-100"
            />
          </div>
          {user?.bookmarks?.includes(data?._id)
            ? <TurnedInIcon onClick={bookmarkHandler} sx={{ fontSize: "30px", cursor: 'pointer' }} className="text-slate-100" />
            : <TurnedInNotIcon onClick={bookmarkHandler} sx={{ fontSize: "30px", cursor: 'pointer' }} className="text-slate-100" />}
        </div>

        <button
          onClick={() => setLikesOpen(true)}
          className="text-sm font-semibold hover:underline"
        >
          {postLikes} {postLikes === 1 ? "like" : "likes"}
        </button>

        {data?.caption && (
          <p className="text-sm mt-1">
            <span className="font-semibold mr-1">{data.author.userName}</span>
            <Linkify
              text={data.caption}
              className={showFullCaption ? "" : "line-clamp-2"}
            />
            {data.caption.length > 80 && (
              <button
                onClick={() => setShowFullCaption((s) => !s)}
                className="text-slate-400 text-xs ml-1 hover:underline"
              >
                {showFullCaption ? "less" : "more"}
              </button>
            )}
          </p>
        )}

        {/* Emoji reactions */}
        <div className="mt-2 flex items-center gap-2">
          {['❤️', '😂', '😮', '😢', '👏'].map((emoji) => {
            const reaction = postReactions?.find((r) => r.emoji === emoji);



            const users = reaction?.users || [];
            const count = users.length;
            const reactedByMe = users.some((id) => id?.toString?.() === user?.id?.toString?.());

            return (
              <button
                key={emoji}
                onClick={async () => {
                  try {
                    const res = await apiClient.post(`/api/post/${data?._id}/react`, { emoji });
                    if (res.data.success) {
                      setPostReactions(res.data.reactions || []);
                      const updatedPosts = posts.map((post) =>
                        post._id === data._id ? { ...post, reactions: res.data.reactions } : post
                      );
                      dispatch(setPosts(updatedPosts));
                    }

                  } catch (e) {
                    console.log(e);
                  }
                }}
                className={`text-sm px-2 py-1 rounded-full border transition ${reactedByMe ? 'bg-red-100 border-red-400' : 'border-zinc-700 bg-transparent hover:bg-zinc-800/40'}`}
                title="React"
              >
                <span className="text-base">{emoji}</span>
                <span className="ml-1 text-xs opacity-80">{count ? count : ''}</span>
              </button>
            );
          })}
        </div>

        {comments.length > 0 &&
          <button className="text-sm text-slate-400 mt-1" onClick={() => {
            dispatch(setSelectedPost(data));
            setCommentDialogOpen(true);
          }}>
            View all {comments.length} comments
          </button>
        }
      </div>

      <div className="mt-2 flex justify-between items-center border-t border-zinc-700 pt-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          type="text"
          placeholder="Add a comment..."
          className="bg-transparent w-full text-sm outline-none placeholder-slate-400"
        />
        <Button onClick={commentHandler} variant="text" size="small">Post</Button>
      </div>

      <CommentDialog
        data={data}
        open={commentDialogOpen}
        handleClose={() => setCommentDialogOpen(false)}
      />

      <LikesDialog
        postId={data._id}
        open={likesOpen}
        handleClose={() => setLikesOpen(false)}
      />

      <Dialog fullWidth maxWidth="xs" open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogContent>
          <p className="text-center font-semibold mb-3">Share post</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={copyPostLink}
              className="w-full py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-700 rounded-xl hover:opacity-90"
            >
              Copy link
            </button>
            {shareLinks.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3 text-center text-sm font-semibold text-white ${s.bg} rounded-xl hover:opacity-90`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
