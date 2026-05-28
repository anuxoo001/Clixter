import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineUsers: [],
  messages: [],
  unSeenMessages: [],
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      const incoming = action.payload;

      if (Array.isArray(incoming)) {
        state.messages = incoming;
      } else {
        const alreadyExists = state.messages.some(
          (msg) => msg._id === incoming._id
        );

        if (!alreadyExists) {
          state.messages.push(incoming);
        }
      }
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    addUnSeenMessages: (state, action) => {
      const incoming = action.payload;

      if (!Array.isArray(state.unSeenMessages)) {
        state.unSeenMessages = [];
      }

      const isDuplicate = state.unSeenMessages.some((msg) => {
        const sameSender = msg.senderId === incoming.senderId;
        const sameReceiver = msg.receiverId === incoming.receiverId;
        const sameText = msg.message === incoming.message;

        const timeDiff = Math.abs(
          new Date(msg.createdAt) - new Date(incoming.createdAt)
        );
        const within5Sec = timeDiff <= 5000;

        return sameSender && sameReceiver && sameText && within5Sec;
      });

      if (!isDuplicate) {
        state.unSeenMessages.push(incoming);
      }
    },

    removeSeenMessagesFromUser: (state, action) => {
      const senderId = action.payload;

      if (!Array.isArray(state.unSeenMessages)) {
        state.unSeenMessages = [];
      }

      state.unSeenMessages = state.unSeenMessages.filter(
        (msg) => msg.senderId !== senderId
      );
    },
  },
    clearUnSeenMessages: (state) => {
      state.unSeenMessages = [];
    },

});

export const {
  setOnlineUsers,
  setMessages,
  addUnSeenMessages,
  removeSeenMessagesFromUser,
  clearUnSeenMessages
} = messageSlice.actions;

export default messageSlice.reducer;
