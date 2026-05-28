import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: 'socketio',
  initialState: {
    socket: null
  },
  reducers: {
    setSocket: (state, actions) => {
      state.socket = actions.payload;
    },
    clearSocket: (state) => {
      state.socket = null;
    }
  }
});


export const { setSocket, clearSocket } = socketSlice.actions;
export default socketSlice.reducer;

