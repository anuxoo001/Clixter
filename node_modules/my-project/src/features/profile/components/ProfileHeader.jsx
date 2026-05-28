import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import useGetUserProfile from '../../../hooks/useGetUserProfile';
import defaultLogo from "../../../assets/images/defaultlogo.png";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Button,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import { addSuggestionUser, removeSuggestionUser, setAuthUser, setSelestedUserForChat } from '../../auth/authSlice';
import { toast } from 'sonner';

const ProfileHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);

  const { user } = useSelector((store) => store.auth);
  const { userProfile } = useSelector((store) => store.user);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'followers' or 'following'

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
  };

  const addToInboxHandler = async (userId) => {
    try {
      const api = import.meta.env.VITE_API || '';
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
        navigate(`/inbox/${addedUser._id}/chat`)
        dispatch(setSelestedUserForChat(addedUser))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const followUnfollowHandler = async (userProfile) => {
    try {
      const api = import.meta.env.VITE_API || '';
      const res = await axios.get(`${api}/api/user/${userProfile?._id}/followunfollow`, { withCredentials: true });
      if (res.data.success) {
        const targetUserId = userProfile?._id
        const currentFollowing = user?.following || [];
        const alreadyFollowing = currentFollowing.includes(targetUserId);
        const updatedFollowing = alreadyFollowing
          ? currentFollowing.filter(id => id !== targetUserId)
          : [...currentFollowing, targetUserId];

        dispatch(setAuthUser({ ...user, following: updatedFollowing }));

        alreadyFollowing
          ? dispatch(addSuggestionUser(userProfile))
          : dispatch(removeSuggestionUser(targetUserId));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }

  }
  const dialogData = dialogType === 'followers' ? userProfile.followers : userProfile.following;

  return (
    <>
      <div className="relative mx-auto mt-10 max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.9)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-16 right-10 h-48 w-48 rounded-full bg-gradient-to-br from-sky-500/20 via-fuchsia-500/15 to-transparent blur-3xl" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="relative mx-auto lg:mx-0">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.24),_rgba(236,72,153,0.16),transparent_65%)] blur-2xl" />
            <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-slate-700/70 bg-slate-900/80 shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)]">
              {userProfile?.profilePicture?.link ? (
                <img
                  src={userProfile.profilePicture.link}
                  alt={userProfile.userName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <Avatar
                  sx={{ bgcolor: "#3f51b5", width: '100%', height: '100%', fontSize: 50 }}
                >
                  {userProfile.userName?.[0]?.toUpperCase() || "?"}
                </Avatar>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">{userProfile.userName}</h2>
                <p className="mt-1 text-sm text-slate-400">{userProfile.fullName} · {userProfile.gender}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {userProfile._id === user.id ? (
                  <>
                    <button
                      onClick={() => navigate(`/${user.id}/updateprofile`)}
                      className="rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                    >
                      Edit Profile
                    </button>
                    <button
                      className="rounded-full bg-slate-800 px-4 py-2 text-sm transition hover:bg-slate-700"
                      onClick={() => navigate(`/${user.id}/updateprofile`)}
                    >
                      ⚙️
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => followUnfollowHandler(userProfile)}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${user?.following?.includes(userProfile._id) ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-sky-500/20 hover:scale-[1.01]'}`}
                    >
                      {user?.following?.includes(userProfile._id) ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={() => addToInboxHandler(userProfile?._id)}
                      className="rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 ring-1 ring-slate-500/40"
                    >
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-900/70 p-4 text-center ring-1 ring-white/5 transition hover:bg-slate-900">
                <p className="text-2xl font-semibold text-white">{userProfile.posts.length}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">Posts</p>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleOpenDialog('followers')}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenDialog('followers')}
                className="rounded-3xl bg-slate-900/70 p-4 text-center ring-1 ring-white/5 transition hover:bg-slate-900 cursor-pointer"
              >
                <p className="text-2xl font-semibold text-white">{userProfile.followers.length}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">Followers</p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleOpenDialog('following')}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenDialog('following')}
                className="rounded-3xl bg-slate-900/70 p-4 text-center ring-1 ring-white/5 transition hover:bg-slate-900 cursor-pointer"
              >
                <p className="text-2xl font-semibold text-white">{userProfile.following.length}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">Following</p>
              </div>

            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.9)]">
              <p className="font-semibold text-white">About</p>
              <p className="mt-2 leading-6 text-slate-400">{userProfile.bio || 'No bio provided yet.'}</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="text-center font-semibold border-b border-gray-400/50">
          {dialogType === "followers" ? "Followers" : "Following"}
        </DialogTitle>

        <DialogContent dividers className="px-0 py-2">
          <List disablePadding>
            {dialogData.length === 0 ? (
              <ListItem className="justify-center py-6">
                <p className="text-sm text-gray-400">
                  No {dialogType} found.
                </p>
              </ListItem>
            ) : (
              dialogData.map((user, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-2 "
                >
                  <div
                    onClick={() => {
                      handleCloseDialog()
                      navigate(`/${user._id}/profile`)
                    }}
                    className="flex items-center  cursor-pointer"
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user?.profilePicture?.link || defaultLogo}
                        alt="profile"
                        className="w-10 h-10"
                      />
                    </ListItemAvatar>
                    <div>
                      <p className="font-semibold text-sm">{user.userName}</p>
                      <p className="text-xs text-gray-400">{user.fullName}</p>
                    </div>
                  </div>

                  {/* <button
                    variant="contained"
                    size="small"
                    className=" text-sm bg-gray-300 text-black font-semibold py-[4px] px-[8px] rounded-md hover:bg-gray-200"
                    disableElevation
                    onClick={() => followUnfollowHandler(user)}
                  >
                    Following
                  </button> */}
                </div>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileHeader;
