import { useEffect, useState, useRef } from "react";
import Avatar from "@mui/material/Avatar";
import { useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useSelector } from "react-redux";
import apiClient from "../../../services/apiClient";
import { isVideoUrl } from "../../../utils/media";
import PostDetailDialog from "../../posts/components/PostDetailDialog";

export default function Search() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { posts } = useSelector((store) => store.post);

  const [query, setQuery] = useState(location.state?.q || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const isHashtag = query.trim().startsWith("#");
  const isMention = query.trim().startsWith("@");

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    if (location.state?.q) {
      setQuery(location.state.q);
    }
  }, [location.state?.q]);

  useEffect(() => {
    const trimmed = query.trim();

    if (isHashtag) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (trimmed.length < 3) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const searchQuery = isMention ? trimmed.replace("@", "") : trimmed;
        const res = await apiClient.get(`/api/user/${searchQuery}/searchprofile`);
        setResults(res.data.users);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const hashtagPosts = isHashtag
    ? posts.filter((p) =>
        p?.caption?.toLowerCase().includes(query.trim().replace("#", "").toLowerCase())
      )
    : [];

  const shouldShowIcon =
    query.trim().length === 0 && !loading && results.length === 0 && hashtagPosts.length === 0;

  return (
    <div className="relative p-4 max-w-xl mx-auto min-h-[60vh] flex flex-col items-center justify-start">
      <div className="relative mb-4 w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users, #hashtags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 pr-10 border rounded-md outline-none bg-white dark:bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.select();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 focus:outline-none"
          >
            &#x2715;
          </button>
        )}
      </div>

      {shouldShowIcon && (
        <div className="flex flex-1 flex-col items-center justify-center mt-10 opacity-30 transition-opacity duration-300">
          <SearchIcon style={{ fontSize: 120 }} className="text-slate-300" />
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Start typing to search users or hashtags
          </p>
        </div>
      )}

      {loading && <p className="text-slate-600 dark:text-slate-400 mt-4">Searching...</p>}

      {/* Hashtag results */}
      {isHashtag && (
        <div className="w-full mt-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Posts tagged{" "}
            <span className="text-sky-500 font-semibold">{query.trim()}</span>
          </p>

          {hashtagPosts.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              No posts found with this tag.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {hashtagPosts.map((post) => (
                <button
                  key={post._id}
                  onClick={() => {
                    setSelectedPost(post);
                    setDetailOpen(true);
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg group"
                >
                  {isVideoUrl(post.media) ? (
                    <video
                      src={post.media}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.media}
                      alt="post"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4 text-white text-sm">
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
          )}
        </div>
      )}

      {/* User results */}
      {!isHashtag && (
        <div className="flex flex-col gap-3 w-full mt-4">
          {query.length > 0 && query.length < 3 && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Enter at least 3 characters to search
            </p>
          )}

          {!loading && results.length === 0 && query.length >= 3 && (
            <p className="text-slate-600 dark:text-slate-400">No users found</p>
          )}

          {results.map((user) => (
            <div
              onClick={() => navigate(`/${user._id}/profile`)}
              key={user._id}
              className="flex items-center gap-3 p-3 cursor-pointer bg-white dark:bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition"
            >
              {user?.profilePicture?.link ? (
                <img
                  src={user.profilePicture.link}
                  alt={user.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <Avatar
                  sx={{ bgcolor: "#3f51b5", width: 40, height: 40, fontSize: 16 }}
                >
                  {user.userName?.[0]?.toUpperCase() || "?"}
                </Avatar>
              )}
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {user.userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.fullName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

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