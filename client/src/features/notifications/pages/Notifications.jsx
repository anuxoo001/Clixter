import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import defaultLogo from "../../../assets/images/defaultlogo.png";
import { clearNotifications } from "../notificationSlice";

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { likeNotification, followNotification, commentNotification } = useSelector(
    (store) => store.realTimeNotification
  );

  const all = [
    ...likeNotification.map((n) => ({ ...n, kind: "like" })),
    ...followNotification.map((n) => ({ ...n, kind: "follow" })),
    ...commentNotification.map((n) => ({ ...n, kind: "comment" })),
  ];

  const messages = {
    like: "liked your post",
    follow: "started following you",
    comment: "commented on your post",
  };

  const icons = {
    like: <FavoriteIcon sx={{ color: "#ed4956" }} />,
    follow: <PersonAddIcon sx={{ color: "#38bdf8" }} />,
    comment: <ChatBubbleIcon sx={{ color: "#34d399" }} />,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {all.length > 0 && (
          <button
            onClick={() => dispatch(clearNotifications())}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {all.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-lg font-semibold text-white">No notifications yet</p>
          <p className="text-sm text-white/50 mt-1">
            Likes, follows and comments will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/10">
          {all.map((notif, idx) => {
            const targetUserName =
              notif.userDetails?.userName || notif.user?.userName || "Unknown";
            const targetId = notif.userId || notif.user?._id;
            return (
              <div key={`${notif.kind}-${idx}`} className="flex items-center gap-3 py-3">
                <button
                  onClick={() => navigate(`${targetId || ""}/profile`)}
                  className="shrink-0"
                >
                  <img
                    src={notif.user?.profilePicture?.link || defaultLogo}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={() => navigate(`${targetId || ""}/profile`)}
                    >
                      {targetUserName}
                    </span>{" "}
                    <span className="text-white/70">{messages[notif.kind]}</span>
                  </p>
                </div>
                <div className="shrink-0">{icons[notif.kind]}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}