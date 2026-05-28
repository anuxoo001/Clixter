import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUnSeenMessages, setMessages } from "../features/messages/messageSlice";
import { setAuthUser } from "../features/auth/authSlice";
import { getSocket } from "../features/socket/socket";
import axios from "axios";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { selectedUserForChat, user } = useSelector((store) => store.auth);

  const handleNewMessage = useCallback(
    async (newMessage) => {
      const isRelevant =
        newMessage.senderId === selectedUserForChat?._id ||
        newMessage.receiverId === selectedUserForChat?._id;

      if (isRelevant) {
        dispatch(setMessages(newMessage));
      } else {
        dispatch(addUnSeenMessages(newMessage));
      }

      const senderId = newMessage.senderId;
      const alreadyInInbox = user?.messageInbox?.some((u) => u._id === senderId);

      if (!alreadyInInbox) {
        try {
          const api = import.meta.env.VITE_API || '';
          const res = await axios.get(
            `${api}/api/user/${senderId}/addtomessageinbox`,
            { withCredentials: true }
          );

          if (res.data.success) {
            const updatedUser = {
              ...user,
              messageInbox: [...(user.messageInbox || []), res.data.addedUser],
            };
            dispatch(setAuthUser(updatedUser));
          }
        } catch (err) {
          console.error("Failed to add to inbox:", err);
        }
      }
    },
    [dispatch, selectedUserForChat, user]
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [handleNewMessage]);
};

export default useGetRTM;
