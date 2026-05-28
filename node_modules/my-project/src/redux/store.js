import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authSlice from '../features/auth/authSlice';
import userSlice from '../features/profile/userSlice';
import postSlice from "../features/posts/postSlice";
import socketSlice from '../features/socket/socketSlice'
import messageSlice from '../features/messages/messageSlice';
import notificationSlice from '../features/notifications/notificationSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  blacklist: ['socket'],
}

const rootReducer = combineReducers({
  auth:authSlice,
  user:userSlice,
  post:postSlice,
  socket:socketSlice,
  message:messageSlice,
  realTimeNotification: notificationSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // socket.io client instance is non-serializable; ignore it.
        ignoredPaths: ['socket.socket'],
      },
    }),
});


export default store;
