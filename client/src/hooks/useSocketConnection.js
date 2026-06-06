// hooks/useSocket.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineUsers } from '../features/messages/messageSlice';
import { connectSocket, disconnectSocket } from '../features/socket/socket';
import { setSocket } from '../features/socket/socketSlice';

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
        try {
          dispatch({ type: 'post/updatePostReactions', payload: { postId, reactions } });
        } catch (e) {
          // ignore
        }
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
