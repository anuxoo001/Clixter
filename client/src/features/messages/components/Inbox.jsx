import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';

import apiClient from '../../../services/apiClient';
import defaultLogo from '../../../assets/images/defaultlogo.png';
import { setAuthUser, setSelestedUserForChat } from '../../auth/authSlice';
import { setConversations, removeSeenMessagesFromUser } from '../messageSlice';
import useGetRTM from '../../../hooks/useGetRTM';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': { transform: 'scale(.8)', opacity: 1 },
    '100%': { transform: 'scale(2.4)', opacity: 0 },
  },
}));

const formatPreviewTime = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

const Inbox = () => {
  useGetRTM();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const selectedUserForChat = params.id;

  const { user } = useSelector((store) => store.auth);
  const { onlineUsers, unSeenMessages, conversations } = useSelector((store) => store.message);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/message/conversations');
      if (res.data.success) {
        dispatch(setConversations(res.data.conversations || []));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, unSeenMessages]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await apiClient.get(`/api/user/${value}/searchprofile`);

      if (res.data.success) {
        const filteredUsers = (res.data.users || []).filter(
          (u) => u._id !== user.id
        );
        setSearchResults(filteredUsers);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const markSeenHandler = useCallback(async (receiverId) => {
    try {
      const res = await apiClient.get(`/api/message/${receiverId}/markseen`);

      if (res.data.success) {
        dispatch(removeSeenMessagesFromUser(receiverId));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!selectedUserForChat) return;

    const hasNewMessageFromSelectedUser = unSeenMessages?.some(
      (msg) => msg?.senderId === selectedUserForChat && msg?.receiverId === user?.id && !msg?.isSeen
    );

    if (hasNewMessageFromSelectedUser) {
      markSeenHandler(selectedUserForChat);
    }
  }, [unSeenMessages, selectedUserForChat, markSeenHandler, user?.id]);

  const addToInboxHandler = async (userId) => {
    try {
      const res = await apiClient.get(`/api/user/${userId}/addtomessageinbox`);
      if (res.data.success) {
        const { addedUser } = res.data;
        const alreadyExists = user.messageInbox?.some(
          (u) => u._id === addedUser._id
        );
        if (!alreadyExists) {
          const updatedUser = {
            ...user,
            messageInbox: [...(user.messageInbox || []), addedUser],
          };
          dispatch(setAuthUser(updatedUser));
        }
        dispatch(setSelestedUserForChat(addedUser));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openChat = (partner) => {
    dispatch(setSelestedUserForChat(partner));
    navigate(`${partner._id}/chat`);
    markSeenHandler(partner._id);
  };

  const renderItem = (conv, isSearchResult = false) => {
    const userItem = conv?.user || conv;
    const unseenCount = isSearchResult ? 0 : conv?.unreadCount || 0;
    const isOnline = onlineUsers.includes(userItem?._id);
    const isSelected = selectedUserForChat === userItem._id;

    return (
      <div
        key={userItem._id}
        onClick={() => {
          if (isSearchResult) {
            addToInboxHandler(userItem?._id);
            setSearchResults([]);
            setSearchTerm('');
          }
          openChat(userItem);
        }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
          isSelected ? 'bg-slate-200/70 dark:bg-slate-800/70' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
        }`}
      >
        <div className="relative flex-shrink-0">
          {isOnline ? (
            <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
              <img
                src={userItem.profilePicture?.link || defaultLogo}
                className="w-12 h-12 rounded-full object-cover"
                alt="profile"
              />
            </StyledBadge>
          ) : (
            <img
              src={userItem.profilePicture?.link || defaultLogo}
              className="w-12 h-12 rounded-full object-cover"
              alt="profile"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate">{userItem.userName}</p>
            <span className="text-[10px] text-slate-400 flex-shrink-0">
              {conv?.lastMessageAt ? formatPreviewTime(conv.lastMessageAt) : ''}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className={`text-xs truncate ${unseenCount > 0 ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
              {isSearchResult
                ? userItem.fullName || 'User'
                : conv?.lastMessage
                ? conv.lastMessage.message
                : isOnline
                ? 'Active now'
                : 'Offline'}
            </p>
            {unseenCount > 0 && (
              <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unseenCount > 9 ? '9+' : unseenCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white text-black border-r border-gray-200 h-full flex flex-col dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800">
      <div className="p-4 font-bold text-xl border-b border-slate-200 dark:border-slate-800">
        Messages
      </div>

      <div className="px-4 py-3">
        <input
          value={searchTerm}
          onChange={handleSearch}
          className="w-full bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm outline-none dark:text-slate-100"
          placeholder="Search people"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {searchResults.length > 0 ? (
          <>
            <p className="text-xs text-slate-400 px-3 py-2">Search Results</p>
            {searchResults.map((u) => renderItem(u, true))}
          </>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => renderItem(conv, false))
        ) : (
          <div className="text-center text-sm text-slate-400 py-10 px-4">
            No conversations yet. Search for people to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;