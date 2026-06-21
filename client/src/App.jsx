import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";

import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./features/messages/messageSlice";
import {
  setFollowNotification,
  setLikeNotification,
} from "./features/notifications/notificationSlice";

import { connectSocket, disconnectSocket } from "./features/socket/socket";
import useGetRTM from "./hooks/useGetRTM";

const App = () => {
  const [theme, setTheme] = useState("dark");

  const dispatch = useDispatch();

  const user = useSelector((store) => store.auth?.user);
  const socketRef = useRef(null);

  useGetRTM();

  // Load theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("clixter_theme");
    setTheme(storedTheme === "light" ? "light" : "dark");
  }, []);

  // Apply theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }

    localStorage.setItem("clixter_theme", theme);
  }, [theme]);

  // Socket connection
  useEffect(() => {
    if (!user?.id) return;

    let socketIo;

    try {
      socketIo = connectSocket(user.id);
      socketRef.current = socketIo;

      socketIo.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketIo.on("likeNotification", (data) => {
        dispatch(setLikeNotification(data));
      });

      socketIo.on("followNotification", (data) => {
        dispatch(setFollowNotification(data));
      });
    } catch (err) {
      console.log("Socket error:", err);
    }

    return () => {
      socketIo?.close();
      disconnectSocket();
      socketRef.current = null;
    };
  }, [user?.id, dispatch]);

  return (
    <div
      className={`app-shell min-h-screen ${
        theme === "dark"
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-100 text-slate-950"
      }`}
    >
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_20%)]" />

        {/* Theme toggle */}
        <div
          className={`fixed right-4 top-4 z-50 rounded-full border px-4 py-2 text-sm shadow-2xl backdrop-blur-xl transition ${
            theme === "dark"
              ? "border-white/15 bg-slate-950/80 text-slate-100"
              : "border-slate-300/60 bg-white/90 text-slate-950"
          }`}
        >
          <span className="mr-3">Theme</span>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              theme === "dark"
                ? "bg-sky-500 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>

        {/* Router */}
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;