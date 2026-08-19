import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge, Menu, MenuItem } from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Movie as MovieIcon,
  Message as MessageIcon,
  AddBox as AddBoxIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { setAuthUser } from '../../features/auth/authSlice';
import CreatePostDialog from '../../features/posts/components/CreatePostDialog';
import apiClient from '../../services/apiClient';

const NavItem = ({ active, onClick, children, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors duration-150 ${
      active ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {children}
    <span className="text-[10px] font-semibold">{label}</span>
  </button>
);

const BottomNav = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useSelector((store) => store.auth);
  const { unSeenMessages } = useSelector((store) => store.message);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const unseenUserCount = new Set(
    (unSeenMessages || [])
      .filter((msg) => msg && msg.senderId)
      .map((msg) => msg.senderId)
  ).size;

  const isActive = (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

  const handleProfileMenuClose = () => setProfileAnchor(null);

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      const res = await apiClient.post(`/api/user/logout`, {});
      if (res.data.success) {
        dispatch(setAuthUser(null));
        toast.success(res.data.message);
        navigate('/auth-login', { replace: true });
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center">
          <NavItem active={isActive('/')} onClick={() => navigate('/')} label="Home">
            <HomeIcon className="text-[26px]" />
          </NavItem>

          <NavItem active={isActive('/search')} onClick={() => navigate('/search')} label="Search">
            <SearchIcon className="text-[26px]" />
          </NavItem>

          <NavItem active={isActive('/reels')} onClick={() => navigate('/reels')} label="Reels">
            <MovieIcon className="text-[26px]" />
          </NavItem>

          <NavItem active={false} onClick={() => setOpenCreateDialog(true)} label="Create">
            <AddBoxIcon className="text-[26px]" />
          </NavItem>

          <NavItem active={isActive('/inbox')} onClick={() => navigate('/inbox')} label="Messages">
            <Badge badgeContent={unseenUserCount || 0} color="error">
              <MessageIcon className="text-[26px]" />
            </Badge>
          </NavItem>

          <NavItem
            active={isActive(`/${user?.id}/profile`)}
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            label="Profile"
          >
            <AccountCircleIcon className="text-[26px]" />
          </NavItem>
        </div>
      </nav>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            navigate(`/${user?.id}/profile`);
          }}
        >
          Open Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      <CreatePostDialog
        open={openCreateDialog}
        handleClose={() => setOpenCreateDialog(false)}
      />
    </>
  );
};

export default BottomNav;