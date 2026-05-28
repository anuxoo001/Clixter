import React, { useState } from 'react';
import {
  Popover,
  Typography,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  Movie as MovieIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  AddBox as AddBoxIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from '../../features/auth/authSlice';
import defaultLogo from "../../assets/images/defaultlogo.png";
import CreatePostDialog from '../../features/posts/components/CreatePostDialog';
import { clearNotifications, setFollowNotification, setLikeNotification } from '../../features/notifications/notificationSlice';
import { addUnSeenMessages, clearUnSeenMessages } from '../../features/messages/messageSlice';

const SidebarItem = ({ data, Icon, label, onClick, likeNotification, followNotification }) => (
  <Tooltip title={label} arrow>
    <div
      onClick={onClick}
      className='cursor-pointer flex items-center gap-x-3 p-2 px-3 rounded-lg transition-colors duration-150 text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
    >
      {label === 'Profile' ? (
        <div className="w-7 h-7 rounded-full overflow-hidden">
          {data?.profilePicture?.link ? (
            <img
              src={data?.profilePicture?.link}
              alt={data?.userName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <Avatar
              sx={{ bgcolor: "#3f51b5", width: '100%', height: '100%', fontSize: 16 }}
            >
              {data?.userName?.[0]?.toUpperCase() || "?"}
            </Avatar>
          )}
        </div>
      ) : label === 'Notifications' ? (
        <Badge badgeContent={likeNotification?.length + followNotification?.length || 0} color="secondary">
          <NotificationsIcon className="text-slate-100" />
        </Badge>
      ) : (
        typeof Icon === 'function' ? <Icon className="text-slate-700 dark:text-slate-100" /> : <Icon className="text-slate-700 dark:text-slate-100" />
      )}
      <p className="text-sm text-slate-700 dark:text-slate-100">{label}</p>
    </div>
  </Tooltip>
);

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const { likeNotification, followNotification } = useSelector(store => store.realTimeNotification);
  const { unSeenMessages } = useSelector(store => store.message);

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const handleMoreClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotifClick = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => {
    setNotifAnchorEl(null)
    dispatch(clearNotifications())
  };

  const open = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchorEl);
  const id = open ? 'more-popover' : undefined;
  const notifId = notifOpen ? 'notification-popover' : undefined;

  const handleLogout = async () => {
    try {
      const api = import.meta.env.VITE_API || '';
      const res = await axios.post(`${api}/api/user/logout`, {}, { withCredentials: true });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        // dispatch(clearUnSeenMessages())
        // dispatch(setLikeNotification([]))
        // dispatch(setFollowNotification([]))
        // localStorage.removeItem('persist:root');
        toast.success(res.data.message);
        navigate('/auth-login', { replace: true });
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };
  const unseenUserCount = new Set(
    (unSeenMessages || [])
      .filter(msg => msg && msg.senderId)  
      .map(msg => msg.senderId)
  ).size; 


  return (
    <>
      <div className='h-screen flex flex-col items-start justify-between py-[2rem] px-[1rem] w-[15rem] relative bg-white dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 border border-gray-200 dark:border-white/10 shadow-glass'>
        <div className='flex flex-col w-full gap-y-[3rem]'>
          <div className='text-[2rem] font-bold text-sky-300' style={{ fontFamily: 'Pacifico, sans-serif' }}>
            Clixter
          </div>
          <div className='flex flex-col gap-y-6 w-full text-sm font-semibold'>
            <SidebarItem Icon={HomeIcon} label='Home' onClick={() => navigate('/')} />
            <SidebarItem Icon={SearchIcon} label='Search' onClick={() => navigate('/search')} />

            <SidebarItem
              Icon={() => (
                <Badge badgeContent={unseenUserCount || 0} color="error">
                  <MessageIcon />
                </Badge>
              )}
              label='Messages'
              onClick={() => navigate("/inbox")}
            />

            <SidebarItem
              Icon={NotificationsIcon}
              label='Notifications'
              likeNotification={likeNotification}
              followNotification={followNotification}
              onClick={handleNotifClick}
            />
            <SidebarItem Icon={AddBoxIcon} label='Create' onClick={() => setOpenCreateDialog(true)} />
            <SidebarItem
              Icon={AccountCircleIcon}
              data={user}
              label='Profile'
              onClick={() => navigate(`${user?.id}/profile`)}
            />
          </div>
        </div>

        <div className='flex flex-col w-full gap-y-4 text-sm relative font-semibold'>
          <div
            className='flex items-center w-full gap-x-3 cursor-pointer p-2 rounded-lg transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            onClick={handleMoreClick}
          >
            <MenuIcon className='text-slate-700 dark:text-slate-100' />
            <p className='text-slate-700 dark:text-slate-100'>More</p>
          </div>
        </div>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
            <div className='p-4 min-w-[150px] font-semibold flex flex-col gap-y-2'>
            {/* <Typography className='cursor-pointer hover:bg-gray-200 p-2 rounded-lg'>
              Settings
            </Typography> */}
            <Typography
              onClick={handleLogout}
                className='cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-800 p-2 rounded-lg'
            >
              Logout
            </Typography>
          </div>
        </Popover>

        <Popover
          id={notifId}
          open={notifOpen}
          anchorEl={notifAnchorEl}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <div className='p-4 min-w-[300px] max-w-[400px]'>
            <Typography variant='h6' className='mb-2 font-semibold'>
              Notifications
            </Typography>
            <Divider />
            <List dense>
              {likeNotification.length === 0 && followNotification.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No new notifications." />
                </ListItem>
              ) : (
                [...likeNotification, ...followNotification].map((notif, idx) => {
                  const isLike = notif.type === 'like';
                  return (
                    <ListItem key={`${notif.type || 'notif'}-${idx}`} alignItems="flex-start">
                      <div className="flex items-start gap-3">
                        <img
                          src={notif.user?.profilePicture?.link || defaultLogo}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <p className="font-semibold text-[12px]">
                            {notif.userDetails?.userName || 'Unknown User'}
                            <span className="font-normal ml-1">
                              {notif.message || (isLike ? 'liked your post' : 'started following you')}
                            </span>
                          </p>
                        </div>
                      </div>
                    </ListItem>
                  );
                })
              )}
            </List>
          </div>
        </Popover>
      </div>

      <CreatePostDialog
        open={openCreateDialog}
        handleClose={() => setOpenCreateDialog(false)}
      />
    </>
  );
};

export default Sidebar;
