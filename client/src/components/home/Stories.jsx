import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import defaultLogo from "../../assets/images/defaultlogo.png";
import { Dialog, DialogTitle, DialogContent, IconButton, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { toast } from "sonner";
import { setPosts } from "../../features/posts/postSlice";
import { readFileAsDataURL } from "../../utils/readFileAsDataURL";
import apiClient from "../../services/apiClient";
import { isVideoUrl } from "../../utils/media";

const STORY_DURATION = 5000;
const TICK_MS = 50;

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

export default function Stories() {
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const [activeIndex, setActiveIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyPreview, setStoryPreview] = useState("");
  const [storyCaption, setStoryCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  const stories = useMemo(() => {
    const map = {};
    posts.forEach((post) => {
      if (!post?.author?._id) return;
      const authorId = post.author._id;
      const existing = map[authorId];
      if (!existing || new Date(post.createdAt) > new Date(existing.createdAt)) {
        map[authorId] = {
          author: post.author,
          media: post.media,
          caption: post.caption,
          createdAt: post.createdAt,
          reactions: post.reactions || [],
          likes: post.likes || [],
        };
      }
    });
    return Object.values(map).slice(0, 12);
  }, [posts]);

  const activeStory = activeIndex !== null ? stories[activeIndex] : null;

  const closeViewer = useCallback(() => {
    setActiveIndex(null);
    setProgress(0);
    setPaused(false);
  }, []);

  const next = useCallback(() => {
    if (activeIndex === null) return;
    if (activeIndex < stories.length - 1) {
      setActiveIndex((i) => i + 1);
      setProgress(0);
    } else {
      closeViewer();
    }
  }, [activeIndex, stories.length, closeViewer]);

  const prev = useCallback(() => {
    if (activeIndex === null) return;
    if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
      setProgress(0);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null || paused) return;

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          return p;
        }
        return p + (TICK_MS / STORY_DURATION) * 100;
      });
    }, TICK_MS);

    return () => clearInterval(timerRef.current);
  }, [activeIndex, paused, next]);

  useEffect(() => {
    if (progress >= 100 && activeIndex !== null) {
      next();
    }
  }, [progress, activeIndex, next]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStoryFile(file);
    setStoryPreview(await readFileAsDataURL(file));
  };

  const resetUploadForm = () => {
    setStoryFile(null);
    setStoryPreview("");
    setStoryCaption("");
    setUploading(false);
  };

  const uploadStory = async () => {
    if (!storyFile) {
      toast.error('Please choose an image or video to upload.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', storyFile);
      formData.append('caption', storyCaption || 'Story update');
      const res = await apiClient.post(`/api/post/addpost`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success('Story uploaded successfully');
        setUploadOpen(false);
        resetUploadForm();
      }
    } catch (error) {
      console.error('Story upload failed:', error);
      toast.error('Story upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative glass-card overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gradient-to-br from-sky-500/30 to-fuchsia-500/20 blur-3xl" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Stories</h3>
          <p className="text-sm text-slate-400">Tap to view the latest story or add your own.</p>
        </div>
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => setUploadOpen(true)}
          className="bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-sky-500/20"
        >
          Add Story
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="group flex flex-col items-center min-w-[80px]"
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/30 via-blue-500/20 to-indigo-500/20 blur-2xl opacity-70 transition group-hover:opacity-100" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/20 bg-slate-950 shadow-[0_0_35px_-10px_rgba(56,189,248,0.5)]">
              <span className="text-3xl text-sky-400">+</span>
            </div>
          </div>
          <span className="mt-2 text-xs text-slate-300 text-center w-20">Your story</span>
        </button>

        {stories.length === 0 ? (
          <div className="text-sm text-gray-500">No stories available yet.</div>
        ) : (
          stories.map((story, index) => (
            <button
              key={story.author._id || index}
              onClick={() => {
                setActiveIndex(index);
                setProgress(0);
              }}
              className="group flex flex-col items-center min-w-[80px]"
              type="button"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-cyan-400/30 blur-xl opacity-75 group-hover:opacity-100" />
                <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-slate-950 p-[2px] shadow-[0_0_35px_-10px_rgba(168,85,247,0.4)]">
                  <img
                    src={story.author.profilePicture?.link || defaultLogo}
                    alt={story.author.userName}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="mt-2 text-xs text-slate-300 text-center truncate w-20">
                {story.author.userName}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Story viewer */}
      <Dialog
        open={activeIndex !== null}
        onClose={closeViewer}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
      >
        {activeStory && (
          <div
            className="relative bg-black rounded-2xl overflow-hidden"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          >
            {/* Progress segments */}
            <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
              {stories.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{
                      width: i < activeIndex ? '100%' : i === activeIndex ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-5 left-3 right-3 z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-sky-500">
                <img
                  src={activeStory.author.profilePicture?.link || defaultLogo}
                  alt={activeStory.author.userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{activeStory.author.userName}</p>
                <p className="text-xs text-white/70">{formatTimeAgo(activeStory.createdAt)}</p>
              </div>
              <IconButton onClick={closeViewer} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </div>

            {/* Media */}
            <div className="flex items-center justify-center h-[70vh]">
              {isVideoUrl(activeStory.media) ? (
                <video
                  src={activeStory.media}
                  autoPlay
                  controls={false}
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeStory.media}
                  alt={activeStory.author.userName}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Caption */}
            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <p className="text-sm">{activeStory.caption}</p>
              </div>
            )}

            {/* Reactions / likes count */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3 text-white">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
                <span className="text-base">❤️</span>
                <span className="text-sm font-semibold">
                  {(activeStory.reactions?.reduce((sum, r) => sum + (r.users?.length || 0), 0) || 0) +
                    (activeStory.likes?.length || 0)}
                </span>
              </div>
            </div>

            {/* Tap zones */}
            <div className="absolute inset-0 flex z-10">
              <button type="button" className="flex-1" onClick={prev} aria-label="Previous story" />
              <div className="w-16 flex items-center justify-center">
                <IconButton onClick={() => setPaused((p) => !p)} sx={{ color: 'white' }} size="small">
                  {paused ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
              </div>
              <button type="button" className="flex-1" onClick={next} aria-label="Next story" />
            </div>

            {/* Arrows */}
            <IconButton
              onClick={prev}
              sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', zIndex: 20 }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={next}
              sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', zIndex: 20 }}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
        )}
      </Dialog>

      <Dialog open={uploadOpen} onClose={() => { setUploadOpen(false); resetUploadForm(); }} fullWidth maxWidth="sm">
        <DialogTitle className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold">Upload Story</span>
          <IconButton onClick={() => { setUploadOpen(false); resetUploadForm(); }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose story media
            </Button>
            {storyPreview && (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                {storyFile?.type?.startsWith('video/') ? (
                  <video controls className="w-full max-h-72 object-contain">
                    <source src={storyPreview} type={storyFile.type} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={storyPreview}
                    alt="story preview"
                    className="w-full max-h-72 object-contain"
                  />
                )}
              </div>
            )}
          </div>

          <textarea
            value={storyCaption}
            onChange={(e) => setStoryCaption(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add a caption (optional)"
          />

          <Button
            variant="contained"
            color="primary"
            disabled={!storyFile || uploading}
            onClick={uploadStory}
          >
            {uploading ? 'Uploading...' : 'Post Story'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}