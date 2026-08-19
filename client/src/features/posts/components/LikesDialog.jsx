import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import defaultLogo from "../../../assets/images/defaultlogo.png";
import apiClient from "../../../services/apiClient";

export default function LikesDialog({ postId, open, handleClose }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    let cancelled = false;

    const fetchLikes = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/post/${postId}/likes`);
        if (!cancelled && res.data.success) setUsers(res.data.users);
      } catch (error) {
        console.log(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLikes();
    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle className="flex items-center justify-between border-b border-gray-400/50">
        <span className="text-center flex-1 font-semibold">Likes</span>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent className="px-0 py-2">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-6">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">No likes yet.</p>
        ) : (
          <div className="flex flex-col">
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => {
                  handleClose();
                  navigate(`/${u._id}/profile`);
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <img
                  src={u.profilePicture?.link || defaultLogo}
                  alt={u.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {u.userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{u.fullName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}