import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addUnSeenMessages,
  setMessages,
  setTyping,
  clearTyping,
  markMessagesSeen,
} from "../features/messages/messageSlice";
import { setAuthUser } from "../features/auth/authSlice";
import { getSocket } from "../features/socket/socket";
import apiClient from "../services/apiClient";

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
          const res = await apiClient.get(
            `/api/user/${senderId}/addtomessageinbox`
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

    const onTyping = (data) => {
      if (data?.senderId === selectedUserForChat?._id) {
        dispatch(setTyping(data));
      }
    };

    const onStopTyping = (data) => {
      if (data?.senderId === selectedUserForChat?._id) {
        dispatch(clearTyping(data.senderId));
      }
    };

    const onMessageSeen = (data) => {
      dispatch(markMessagesSeen({ chatWith: data?.chatWith }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("messageSeen", onMessageSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("messageSeen", onMessageSeen);
    };
  }, [handleNewMessage, selectedUserForChat, dispatch]);
};

export default useGetRTM;