import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import ShareIcon from "@mui/icons-material/Share";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import defaultLogo from "../../../assets/images/defaultlogo.png";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "../postSlice";
import { setAuthUser } from "../../auth/authSlice";
import apiClient from "../../../services/apiClient";
import CommentDialog from "../../comments/components/CommentDialog";
import { isVideoUrl } from "../../../utils/media";

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const ActionButton = ({ onClick, icon, count, label }) => (
  <div className="flex flex-col items-center gap-1">
    <IconButton onClick={onClick} sx={{ color: "white", padding: 0.5 }}>
      {icon}
    </IconButton>
    <span className="text-xs text-white/90">{count || ""}</span>
  </div>
);

const ReelItem = ({ data, onComment }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const videoRef = useRef(null);

  const [liked, setLiked] = useState(
    data?.likes?.some((id) => id?.toString?.() === user?.id?.toString?.())
  );
  const [likeCount, setLikeCount] = useState(data?.likes?.length || 0);
  const [bookmarked, setBookmarked] = useState(user?.bookmarks?.includes(data?._id));
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setPlaying(true);
          } else {
            video.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const likeHandler = async () => {
    try {
      const res = await apiClient.get(`/api/post/${data._id}/likeordislike`);
      if (res.data.success) {
        const newLiked = res.data.liked;
        setLiked(newLiked);
        setLikeCount((c) => (newLiked ? c + 1 : c - 1));

        const updatedPosts = posts.map((post) =>
          post._id === data._id
            ? {
                ...post,
                likes: newLiked
                  ? [...post.likes, user.id]
                  : post.likes.filter((id) => id !== user.id),
              }
            : post
        );
        dispatch(setPosts(updatedPosts));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await apiClient.get(`/api/post/${data._id}/bookmark`);
      if (res.data.success) {
        const currentBookmarks = user?.bookmarks || [];
        const already = currentBookmarks.includes(data._id);
        const updated = already
          ? currentBookmarks.filter((id) => id !== data._id)
          : [...currentBookmarks, data._id];
        setBookmarked(!already);
        dispatch(setAuthUser({ ...user, bookmarks: updated }));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-full snap-start relative bg-black">
      <video
        ref={videoRef}
        src={data.media}
        loop
        muted={muted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="w-full h-full object-contain"
      />

      {/* Bottom caption + author */}
      <div className="absolute bottom-4 left-4 right-16 text-white">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(`${data.author?._id || ""}/profile`)}
        >
          <img
            src={data.author?.profilePicture?.link || defaultLogo}
            alt={data.author?.userName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-500"
          />
          <span className="font-semibold text-sm">{data.author?.userName}</span>
          <span className="text-xs text-white/60">{formatTimeAgo(data.createdAt)}</span>
        </div>
        {data.caption && (
          <p className="mt-1 text-sm text-white/90 line-clamp-2">{data.caption}</p>
        )}
      </div>

      {/* Right action rail */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
        <ActionButton
          onClick={likeHandler}
          label="Like"
          count={likeCount}
          icon={
            liked ? (
              <FavoriteIcon sx={{ fontSize: 30, color: "#ed4956" }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 30 }} />
            )
          }
        />
        <ActionButton
          onClick={() => onComment(data)}
          label="Comment"
          count={data?.comments?.length || 0}
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />}
        />
        <ActionButton
          onClick={bookmarkHandler}
          label="Save"
          icon={
            bookmarked ? (
              <TurnedInIcon sx={{ fontSize: 30 }} />
            ) : (
              <TurnedInNotIcon sx={{ fontSize: 30 }} />
            )
          }
        />
        <IconButton
          onClick={() => setMuted((m) => !m)}
          sx={{ color: "white", padding: 0.5 }}
        >
          {muted ? (
            <VolumeOffIcon sx={{ fontSize: 30 }} />
          ) : (
            <VolumeUpIcon sx={{ fontSize: 30 }} />
          )}
        </IconButton>
        <IconButton onClick={() => onComment(data)} sx={{ color: "white", padding: 0.5 }}>
          <ShareIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </div>
    </div>
  );
};

export default function Reels() {
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentOpen, setCommentOpen] = useState(false);

  const reels = posts.filter((post) => post?.media && isVideoUrl(post.media));

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Reels</h1>
        <span className="text-xs text-white/60">{reels.length} videos</span>
      </div>

      {reels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-lg font-semibold text-white">No Reels yet</p>
          <p className="text-sm text-white/50 mt-1">
            Upload a video in a post and it will appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide">
          {reels.map((reel) => (
            <ReelItem
              key={reel._id}
              data={reel}
              onComment={(post) => {
                dispatch(setSelectedPost(post));
                setSelectedPost(post);
                setCommentOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <CommentDialog
          data={selectedPost}
          open={commentOpen}
          handleClose={() => setCommentOpen(false)}
        />
      )}
    </div>
  );
}