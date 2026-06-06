// hooks/useSocket.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineUsers } from '../features/messages/messageSlice';
import { connectSocket, disconnectSocket } from '../features/socket/socket';
import { setSocket } from '../features/socket/socketSlice';
+import { updatePostReactions } from '../features/posts/postSlice';

export const useSocketConnection = (user) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) {
      const socket = connectSocket(user.id);

      dispatch(setSocket(socket))

      socket.on('getOnlineUsers', (users) => {
        dispatch(setOnlineUsers(users));
      });
      socket.on('postReactionsUpdated', ({ postId, reactions }) => {
        dispatch(updatePostReactions({ postId, reactions }));
      });

      return () => {
        disconnectSocket()
        dispatch(setSocket(null))
      };
    } else {
      disconnectSocket();
      dispatch(setSocket(null))
    }
  }, [user, dispatch]);
};
