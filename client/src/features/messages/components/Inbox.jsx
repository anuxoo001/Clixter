import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import axios from 'axios';

import defaultLogo from '../../../assets/images/defaultlogo.png';
import { setAuthUser, setSelestedUserForChat } from '../../auth/authSlice';
import { removeSeenMessagesFromUser } from '../messageSlice';
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

const Inbox = () => {
  useGetRTM();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const selectedUserForChat = params.id;

  const { user } = useSelector((store) => store.auth);
  const { onlineUsers, unSeenMessages } = useSelector((store) => store.message);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const api = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${api}/api/user/${value}/searchprofile`, {
        withCredentials: true,
      });

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

  const getUnseenCount = (userId) => {
    return unSeenMessages?.filter(
      (msg) => msg?.senderId === userId && msg?.receiverId === user.id && !msg?.isSeen
    ).length;
  };

  const markSeenHandler = async (receiverId) => {
    try {
      const api = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${api}/api/message/${receiverId}/markseen`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(removeSeenMessagesFromUser(receiverId));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!selectedUserForChat) return;

    const hasNewMessageFromSelectedUser = unSeenMessages?.some(
      (msg) => msg?.senderId === selectedUserForChat && msg?.receiverId === user?.id && !msg?.isSeen
    );

    if (hasNewMessageFromSelectedUser) {
      markSeenHandler(selectedUserForChat);
    }
  }, [unSeenMessages, selectedUserForChat]);

  const addToInboxHandler = async (userId) => {
    try {
      const api = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${api}/api/user/${userId}/addtomessageinbox`, { withCredentials: true })
      if (res.data.success) {
        const { addedUser } = res.data;
        const alreadyExists = user.messageInbox?.some(
          (u) => u._id === addedUser._id
        );
        if (!alreadyExists) {
          const updatedUser = {
            ...user,
            messageInbox: [...(user.messageInbox || []), addedUser],
          }
          dispatch(setAuthUser(updatedUser))
        }
        // navigate(`/inbox/${addedUser._id}/chat`)
        dispatch(setSelestedUserForChat(addedUser))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-white text-black border-r border-gray-200 h-screen flex flex-col dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800">
      <div className="p-4 font-bold text-xl border-gray-700 dark:border-slate-800">{user?.userName}</div>


      <div className="flex justify-around text-sm mt-2 border-b border-gray-200 dark:border-slate-800">
        <p className="py-2 text-gray-400 dark:text-slate-300">Inbox</p>
      </div>


      <div className="px-4 py-2">
        <input
          value={searchTerm}
          onChange={handleSearch}
          className="w-full bg-gray-200 rounded px-3 py-1 text-sm dark:bg-slate-900 dark:text-slate-100" 

          placeholder="Search"
        />
      </div>

      <div className="flex flex-col px-2 overflow-y-auto">
        {[...user?.messageInbox]
          ?.sort((a, b) => getUnseenCount(b._id) - getUnseenCount(a._id))
          .map((userItem, i) => {
            const isOnline = onlineUsers.includes(userItem?._id);
            const isSelected = selectedUserForChat === userItem._id;
            const unseenCount = getUnseenCount(userItem._id);

            return (
              <div
                key={userItem._id}
                onClick={() => {
                  dispatch(setSelestedUserForChat(userItem));
                  navigate(`${userItem._id}/chat`);
                  markSeenHandler(userItem._id);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer 
                  ${isSelected ? 'bg-gray-300/50' : 'hover:bg-gray-100/50'}`}
              >
                <div className="relative">
                  {isOnline ? (
                    <StyledBadge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                    >
                      <img
                        src={userItem.profilePicture?.link || defaultLogo}
                        className="w-10 h-10 rounded-full"
                        alt="profile"
                      />
                    </StyledBadge>
                  ) : (
                    <img
                      src={userItem.profilePicture?.link || defaultLogo}
                      className="w-10 h-10 rounded-full"
                      alt="profile"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">
                      {userItem.userName} <span className="text-blue-500">✔</span>
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p
                      className={`text-[11px] font-medium opacity-[.8] ${
                        isOnline ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isOnline ? 'online' : 'offline'}
                    </p>
                    {unseenCount > 0 && selectedUserForChat !== userItem._id && (
                      <p className="text-[10px] text-blue-600 font-semibold ml-2">
                        • {unseenCount > 9 ? '9+' : unseenCount} new message
                        {unseenCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {searchResults.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-2">
            <p className="text-xs text-gray-500 mb-2">Search Results</p>
            {searchResults.map((userItem) => {
              const isOnline = onlineUsers.includes(userItem?._id);

              return (
                <div
                  key={`search-${userItem._id}`}
                  onClick={() => {
                    addToInboxHandler(userItem?._id)
                    dispatch(setSelestedUserForChat(userItem));
                    navigate(`${userItem._id}/chat`);
                    markSeenHandler(userItem._id);
                    setSearchResults([]);
                    setSearchTerm('');
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-gray-100/50"
                >
                  <div className="relative">
                    {isOnline ? (
                      <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                      >
                        <img
                          src={userItem.profilePicture?.link || defaultLogo}
                          className="w-10 h-10 rounded-full"
                          alt="profile"
                        />
                      </StyledBadge>
                    ) : (
                      <img
                        src={userItem.profilePicture?.link || defaultLogo}
                        className="w-10 h-10 rounded-full"
                        alt="profile"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{userItem.userName}</p>
                    <p className="text-[11px] text-gray-500">{userItem.fullName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
