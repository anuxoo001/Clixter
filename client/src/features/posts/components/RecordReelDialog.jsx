import { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import StopIcon from "@mui/icons-material/Stop";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../postSlice";
import apiClient from "../../../services/apiClient";

export default function RecordReelDialog({ open, handleClose }) {
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [streamActive, setStreamActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const timerRef = useRef(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStreamActive(true);
      setCameraError("");
    } catch (error) {
      console.log(error);
      setCameraError("Camera access denied. Please allow camera and microphone permissions.");
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamActive(false);
  };

  useEffect(() => {
    if (open) {
      setRecordedUrl("");
      setRecordedBlob(null);
      setCaption("");
      setCameraError("");
      setElapsed(0);
      startStream();
    } else {
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
      recorderRef.current?.stop();
      recorderRef.current = null;
      chunksRef.current = [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9,opus",
    });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      stopStream();
    };

    recorder.start();
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    recorderRef.current?.stop();
  };

  const discard = () => {
    setRecordedUrl("");
    setRecordedBlob(null);
    setCaption("");
    startStream();
  };

  const upload = async () => {
    if (!recordedBlob) return;
    setUploading(true);
    try {
      const fileName = `reel-${Date.now()}.webm`;
      const formData = new FormData();
      formData.append("media", new File([recordedBlob], fileName, { type: recordedBlob.type }));
      formData.append(
        "caption",
        caption.trim() ? `${caption.trim()} #reel` : "#reel"
      );

      const res = await apiClient.post("/api/post/addpost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Reel uploaded successfully");
        dispatch(setPosts([res.data.post, ...posts]));
        handleClose();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to upload reel");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center justify-between">
        <span className="text-lg font-semibold">Record Reel</span>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {cameraError ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <VideocamOffIcon sx={{ fontSize: 56 }} className="text-slate-500" />
            <p className="text-sm text-slate-500">{cameraError}</p>
            <Button variant="outlined" onClick={startStream}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!recordedUrl ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full h-72 object-cover"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  {!recording ? (
                    <button
                      onClick={startRecording}
                      disabled={!streamActive}
                      className="flex items-center gap-2 rounded-full bg-red-500 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      <FiberManualRecordIcon sx={{ fontSize: 18 }} />
                      Record
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 rounded-full bg-white text-red-500 px-4 py-2 text-sm font-semibold"
                    >
                      <StopIcon sx={{ fontSize: 18 }} />
                      Stop · {formatTime(elapsed)}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <video src={recordedUrl} controls className="w-full h-72 rounded-lg bg-black object-contain" />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-white/10 rounded-md bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {recordedUrl && (
        <DialogActions className="p-4">
          <Button onClick={discard} color="error">
            Discard
          </Button>
          <Button variant="contained" color="primary" onClick={upload} disabled={uploading}>
            {uploading ? "Uploading..." : "Post Reel"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}