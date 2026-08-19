import apiClient from "../../../services/apiClient";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, clearTyping } from "../messageSlice";
import { setSelestedUserForChat } from "../../auth/authSlice";
import useGetAllMessage from "../../../hooks/useGetAllMessage";
import useGetRTM from "../../../hooks/useGetRTM";
import { getSocket } from "../../socket/socket";
import defaultlogo from "../../../assets/images/defaultlogo.png";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack, Phone, VideoCall, Send as SendIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const formatClock = (timestamp) => {
  const d = new Date(timestamp);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const formatDay = (timestamp) => {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const DaySeparator = ({ label }) => (
  <div className="flex items-center justify-center my-4">
    <span className="px-3 py-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/60 rounded-full">
      {label}
    </span>
  </div>
);

export default function Chat() {
  useGetAllMessage();
  useGetRTM();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const typingTimerRef = useRef(null);

  const { messages, typing } = useSelector((store) => store.message);
  const { selectedUserForChat, user } = useSelector((store) => store.auth);
  const { onlineUsers } = useSelector((store) => store.message);

  const bottomRef = useRef(null);
  const isOnline = onlineUsers?.includes(id);

  useEffect(() => {
    dispatch(clearTyping(id));
    setMessageText("");

    if (selectedUserForChat?._id !== id) {
      (async () => {
        try {
          const res = await apiClient.get(`/api/user/${id}/profile`);
          if (res.data.success) {
            dispatch(setSelestedUserForChat(res.data.user));
          } else {
            dispatch(setSelestedUserForChat({ _id: id }));
          }
        } catch (error) {
          dispatch(setSelestedUserForChat({ _id: id }));
        }
      })();
    }
  }, [id, dispatch, selectedUserForChat?._id]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, typing]);

  const emitTyping = (value) => {
    const socket = getSocket();
    if (!socket || !value.trim() || !selectedUserForChat?._id) return;

    socket.emit("typing", {
      senderId: user?.id,
      receiverId: selectedUserForChat?._id,
    });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: user?.id,
        receiverId: selectedUserForChat?._id,
      });
    }, 1200);
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || isSending || !selectedUserForChat?._id) return;

    setIsSending(true);
    try {
      const socket = getSocket();
      socket?.emit("stopTyping", {
        senderId: user?.id,
        receiverId: selectedUserForChat?._id,
      });

      const res = await apiClient.post(`/api/message/send/${selectedUserForChat?._id}`, {
        messageText: trimmed,
      });

      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setMessageText("");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSending(false);
    }
  };

  const lastOutgoingId = [...messages]
    .reverse()
    .find((m) => m?.senderId === user?.id)?._id;

  const renderMessages = () => {
    const grouped = [];
    let lastDay = null;

    messages.forEach((message) => {
      const day = formatDay(message?.createdAt);
      if (day !== lastDay) {
        grouped.push({ type: "day", label: day });
        lastDay = day;
      }
      grouped.push({ type: "msg", message });
    });

    return grouped.map((item, idx) => {
      if (item.type === "day") return <DaySeparator key={`day-${idx}`} label={item.label} />;

      const message = item.message;
      const mine = message?.senderId === user?.id;
      const isLastOutgoing = mine && message?._id === lastOutgoingId;

      return (
        <div key={message?._id || idx} className={`flex w-full mb-2 ${mine ? "justify-end" : "justify-start"}`}>
          {!mine && (
            <img
              src={selectedUserForChat?.profilePicture?.link || defaultlogo}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-1"
            />
          )}
          <div className={`flex flex-col max-w-[70%] ${mine ? "items-end" : "items-start"}`}>
            <div
              className={`px-4 py-2 text-sm leading-relaxed break-words ${
                mine
                  ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl rounded-br-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-bl-md"
              }`}
            >
              {message?.message}
            </div>
            <div className="flex items-center gap-1 mt-0.5 px-1">
              <span className="text-[10px] text-slate-400">{formatClock(message?.createdAt)}</span>
              {mine && (
                <span className={`text-[10px] font-medium ${message?.isSeen ? "text-sky-400" : "text-slate-400"}`}>
                  {message?.isSeen ? "Seen" : "Sent"}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white text-black dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <IconButton size="small" onClick={() => navigate("/inbox")} className="md:hidden">
            <ArrowBack className="text-slate-500" />
          </IconButton>

          <div className="relative">
            <img
              src={selectedUserForChat?.profilePicture?.link || defaultlogo}
              className="w-10 h-10 rounded-full object-cover"
              alt="user"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </div>

          <div className="ml-2">
            <p className="font-semibold text-sm">{selectedUserForChat?.userName}</p>
            <p className={`text-xs ${isOnline ? "text-green-500" : "text-slate-400"}`}>
              {typing?.senderId === selectedUserForChat?._id ? "typing..." : isOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <IconButton size="small" onClick={() => navigate(`/${id}/profile`)}>
            <Phone />
          </IconButton>
          <IconButton size="small" onClick={() => navigate(`/${id}/profile`)}>
            <VideoCall />
          </IconButton>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <img
              src={selectedUserForChat?.profilePicture?.link || defaultlogo}
              alt="user"
              className="w-20 h-20 rounded-full object-cover mb-3"
            />
            <p className="font-semibold">{selectedUserForChat?.userName}</p>
            <p className="text-sm text-slate-400">Say hi to start a conversation.</p>
          </div>
        ) : (
          renderMessages()
        )}

        {typing?.senderId === selectedUserForChat?._id && (
          <div className="flex items-center gap-2 mt-2">
            <img
              src={selectedUserForChat?.profilePicture?.link || defaultlogo}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md">
              <span className="typing-dots inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessageHandler}
        className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
      >
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5">
          <input
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              emitTyping(e.target.value);
            }}
            className="bg-transparent flex-1 py-1.5 outline-none text-sm placeholder-slate-400"
            placeholder="Message..."
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </form>
    </div>
  );
}