import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { setSelectedPost } from "../postSlice";
import PostDetailDialog from "../components/PostDetailDialog";
import { isVideoUrl } from "../../../utils/media";

export default function Explore() {
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openPost = (post) => {
    dispatch(setSelectedPost(post));
    setSelectedPost(post);
    setDetailOpen(true);
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div className="text-6xl mb-4">🧭</div>
        <p className="text-lg font-semibold text-white">Explore</p>
        <p className="text-sm text-white/50 mt-1">No posts to discover yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-white mb-4">Explore</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {posts.map((post) => (
          <button
            key={post._id}
            onClick={() => openPost(post)}
            className="relative aspect-square overflow-hidden rounded-lg group bg-black"
          >
            {isVideoUrl(post.media) ? (
              <video
                src={post.media}
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <img
                src={post.media}
                alt={post.caption || "post"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-5 text-white text-sm">
              <span className="flex items-center gap-1">
                <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                {post.likes?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                {post.comments?.length || 0}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedPost && (
        <PostDetailDialog
          post={selectedPost}
          open={detailOpen}
          handleClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}