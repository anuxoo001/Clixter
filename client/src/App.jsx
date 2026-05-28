import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineUsers } from './features/messages/messageSlice';
import { setFollowNotification, setLikeNotification } from './features/notifications/notificationSlice';
import { connectSocket, disconnectSocket } from './features/socket/socket';
import useGetRTM from './hooks/useGetRTM';

const App = () => {
  const [theme, setTheme] = useState('dark');
  useGetRTM();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('clixter_theme');
    setTheme(storedTheme === 'light' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('clixter_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user?.id) {
      const socketIo = connectSocket(user.id);
      socketRef.current = socketIo;

      socketIo.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketIo.on('likeNotification', (likeNotification) => {
        dispatch(setLikeNotification(likeNotification));
      });

      socketIo.on('followNotification', (followNotification) => {
        dispatch(setFollowNotification(followNotification));
      });

      return () => {
        socketIo.close();
        disconnectSocket();
        socketRef.current = null;
      };
    }

    return () => {
      socketRef.current?.close();
      disconnectSocket();
      socketRef.current = null;
    };
  }, [user, dispatch]);

  return (
    <div className={`app-shell min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-950'}`}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_20%)]" />
        <div className={`fixed right-4 top-4 z-50 rounded-full border px-4 py-2 text-sm shadow-2xl backdrop-blur-xl transition ${theme === 'dark' ? 'border-white/15 bg-slate-950/80 text-slate-100 shadow-slate-950/40' : 'border-slate-300/60 bg-white/90 text-slate-950 shadow-slate-300/20'}`}>
          <span className={`mr-3 transition ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>Theme</span>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`rounded-full px-3 py-1 font-semibold transition hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-900 text-white shadow-lg shadow-slate-500/20'}`}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
        <div className="relative">
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </div>
      </div>
    </div>
  );
};

export default App
