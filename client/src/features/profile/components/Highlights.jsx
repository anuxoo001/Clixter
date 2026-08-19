import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  IconButton,
  DialogTitle,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import apiClient from "../../../services/apiClient";
import { isVideoUrl } from "../../../utils/media";
import Linkify from "../../../components/common/Linkify";

const STORY_DURATION = 5000;
const TICK_MS = 50;

const Highlights = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { user } = useSelector((store) => store.auth);
  const { userProfile } = useSelector((store) => store.user);

  const [highlights, setHighlights] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeItem, setActiveItem] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const [title, setTitle] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [cover, setCover] = useState("");
  const [creating, setCreating] = useState(false);

  const isOwnProfile = user?.id === userProfile?._id;
  const ownPosts = isOwnProfile ? userProfile?.posts || [] : [];

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await apiClient.get(`/api/highlight/${id}`);
        if (res.data.success) setHighlights(res.data.highlights);
      } catch (error) {
        console.log(error);
      }
    };
    if (id) fetchHighlights();
  }, [id]);

  const active = activeIndex !== null ? highlights[activeIndex] : null;
  const activeItemData = active?.items?.[activeItem];

  const closeViewer = useCallback(() => {
    setActiveIndex(null);
    setActiveItem(0);
    setProgress(0);
    setPaused(false);
  }, []);

  const next = useCallback(() => {
    if (activeIndex === null) return;
    if (activeItem < active.items.length - 1) {
      setActiveItem((i) => i + 1);
      setProgress(0);
    } else if (activeIndex < highlights.length - 1) {
      setActiveIndex((i) => i + 1);
      setActiveItem(0);
      setProgress(0);
    } else {
      closeViewer();
    }
  }, [activeIndex, activeItem, active, highlights.length, closeViewer]);

  const prev = useCallback(() => {
    if (activeIndex === null) return;
    if (activeItem > 0) {
      setActiveItem((i) => i - 1);
      setProgress(0);
    } else if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
      setActiveItem(highlights[activeIndex - 1].items.length - 1);
      setProgress(0);
    }
  }, [activeIndex, activeItem, highlights]);

  useEffect(() => {
    if (activeIndex === null || paused || !active) return;

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return p;
        }
        return p + (TICK_MS / STORY_DURATION) * 100;
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [activeIndex, paused, active]);

  useEffect(() => {
    if (progress >= 100 && activeIndex !== null) next();
  }, [progress, activeIndex, next]);

  const togglePostSelection = (post) => {
    setSelectedPosts((prev) => {
      const exists = prev.some((p) => p._id === post._id);
      const next = exists ? prev.filter((p) => p._id !== post._id) : [...prev, post];
      if (!cover || !next.some((p) => p._id === cover)) {
        setCover(next[0]?._id || "");
      }
      return next;
    });
  };

  const createHighlight = async () => {
    if (selectedPosts.length === 0) {
      toast.error("Select at least one post");
      return;
    }
    setCreating(true);
    try {
      const coverPost = selectedPosts.find((p) => p._id === cover) || selectedPosts[0];
      const items = selectedPosts.map((p) => ({
        media: p.media,
        mediaType: isVideoUrl(p.media) ? "video" : "image",
        caption: p.caption || "",
      }));
      const res = await apiClient.post("/api/highlight", {
        title: title.trim() || "Highlights",
        cover: coverPost.media,
        items,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setHighlights((prev) => [res.data.highlight, ...prev]);
        setCreateOpen(false);
        setTitle("");
        setSelectedPosts([]);
        setCover("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to create highlight");
    } finally {
      setCreating(false);
    }
  };

  const deleteHighlight = async (highlightId) => {
    if (!window.confirm("Delete this highlight?")) return;
    try {
      const res = await apiClient.delete(`/api/highlight/${highlightId}`);
      if (res.data.success) {
        setHighlights((prev) => prev.filter((h) => h._id !== highlightId));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex gap-6 justify-start px-4 mt-6 flex-wrap">
      {isOwnProfile && (
        <button
          onClick={() => setCreateOpen(true)}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-16 rounded-full border border-white/15 flex items-center justify-center text-3xl text-slate-400 group-hover:border-sky-400 group-hover:text-sky-400 transition">
            <AddIcon />
          </div>
          <p className="text-xs text-slate-400">New</p>
        </button>
      )}

      {highlights.map((highlight, i) => (
        <div key={highlight._id} className="flex flex-col items-center gap-2 group relative">
          <button
            onClick={() => {
              setActiveIndex(i);
              setActiveItem(0);
              setProgress(0);
            }}
            className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-sky-500/80 p-[2px]"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
              {highlight.cover ? (
                <img
                  src={highlight.cover}
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  H
                </div>
              )}
            </div>
          </button>
          <p className="text-xs text-slate-300">{highlight.title}</p>
          {isOwnProfile && (
            <button
              onClick={() => deleteHighlight(highlight._id)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition"
            >
              x
            </button>
          )}
        </div>
      ))}

      {/* Viewer */}
      <Dialog
        open={activeIndex !== null}
        onClose={closeViewer}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { backgroundColor: "transparent", boxShadow: "none", overflow: "visible" } }}
      >
        {active && (
          <div
            className="relative bg-black rounded-2xl overflow-hidden"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
              {active.items.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{
                      width:
                        i < activeItem ? "100%" : i === activeItem ? `${progress}%` : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-5 left-3 right-3 z-10 flex items-center gap-3">
              <p className="font-semibold text-white text-sm">{active.title}</p>
              <div className="flex-1" />
              <IconButton onClick={closeViewer} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </div>

            <div className="flex items-center justify-center h-[70vh]">
              {isVideoUrl(activeItemData?.media) ? (
                <video
                  src={activeItemData.media}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeItemData?.media}
                  alt={active.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {activeItemData?.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <Linkify text={activeItemData.caption} />
              </div>
            )}

            <div className="absolute inset-0 flex z-10">
              <button type="button" className="flex-1" onClick={prev} aria-label="Previous" />
              <button type="button" className="flex-1" onClick={next} aria-label="Next" />
            </div>

            <IconButton
              onClick={prev}
              sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "white", zIndex: 20 }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={next}
              sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "white", zIndex: 20 }}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
        )}
      </Dialog>

      {/* Create highlight */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">New highlight</span>
          <IconButton onClick={() => setCreateOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <div className="p-4 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Highlight name (e.g. Travel, Food)"
            className="w-full p-3 border border-gray-300 dark:border-white/10 rounded-md bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Select posts to add
          </p>

          {ownPosts.length === 0 ? (
            <p className="text-sm text-slate-500">You have no posts yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {ownPosts.map((post) => {
                const selected = selectedPosts.some((p) => p._id === post._id);
                const isCover = cover === post._id;
                return (
                  <button
                    key={post._id}
                    onClick={() => togglePostSelection(post)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                      selected ? "border-sky-500" : "border-transparent"
                    }`}
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
                    {isCover && (
                      <span className="absolute top-1 left-1 text-[10px] bg-sky-500 text-white rounded px-1">
                        Cover
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={selectedPosts.length === 0 || creating}
            onClick={createHighlight}
          >
            {creating ? "Creating..." : "Create highlight"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default Highlights;