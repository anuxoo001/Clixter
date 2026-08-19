import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useSelector , useDispatch } from 'react-redux';
import { readFileAsDataURL } from '../../../utils/readFileAsDataURL';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { setAuthUser } from '../../auth/authSlice';
import apiClient from '../../../services/apiClient';

const UpdateProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((store) => store.auth);
  const fileInputRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: user.bio || '',
    gender: user.gender || '',
    profilePicture: user.profilePicture?.link || '',
    profilePictureFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64Image = await readFileAsDataURL(file);
      setFormData((prev) => ({
        ...prev,
        profilePicture: base64Image,
        profilePictureFile: file,
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('UpdateProfile: submit clicked', formData);
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('gender', formData.gender);
      if (formData.profilePictureFile) {
        formDataToSend.append('profilePhoto', formData.profilePictureFile);
      }

      const res = await apiClient.post('/api/user/profile/edit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        const updatedFields = {
          bio: res.data.user.bio,
          gender: res.data.user.gender,
          profilePicture: {
            link: res.data.user.profilePicture?.link || '',
            fileName: res.data.user.profilePicture?.fileName || '',
          },
        };

        dispatch(setAuthUser({
          ...user,
          ...updatedFields,
        }));
        toast.success('Profile updated successfully!');
        navigate(`/${user.id}/profile`)
      }
    } catch (error) {
      console.error('Error updating profile:', error, error.response?.data || error.message);

      const apiErrorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      toast.error(apiErrorMessage || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }

  };

  const isDark = document?.documentElement?.classList?.contains('dark');

  return (
    <Box
      sx={{
        bgcolor: isDark ? 'rgb(2 6 23 / 1)' : '#fff', // match slate-950 vibe
        color: isDark ? '#e2e8f0' : '#000',
        minHeight: '100vh',
        px: { xs: 2, md: 10 },
        py: 6,
      }}
    >



      <Typography
        variant="h5"
        fontWeight={700}
        mb={4}
        sx={{ color: isDark ? '#e5e7eb' : '#000' }}
      >
        Edit Profile
      </Typography>


      <Box display="flex" alignItems="center" mb={5}>
        <Avatar
          {...(formData.profilePicture ? { src: formData.profilePicture } : {})}
          sx={{ bgcolor: "#3f51b5", width: 64, height: 64, mr: 3 }}
        >
          {!formData.profilePicture && user.userName?.[0]?.toUpperCase()}
        </Avatar>

        <Box>
          <Typography fontWeight={700} fontSize={18} sx={{ color: isDark ? '#e5e7eb' : '#000' }}>
            {user.userName}
          </Typography>
          <Typography sx={{ color: isDark ? '#cbd5e1' : 'text.secondary' }}>
            {user.fullName}
          </Typography>


        </Box>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <Button
          variant="outlined"
          sx={{ ml: 'auto', borderRadius: 2, textTransform: 'none' }}
          onClick={() => fileInputRef.current.click()}
        >
          Change photo
        </Button>
      </Box>

      <Box mt={4}>
        <Typography fontWeight={600} mb={1}>
          Bio
        </Typography>
        <TextField
          fullWidth
          name="bio"
          multiline
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          inputProps={{ maxLength: 150 }}
          helperText={`${formData.bio.length} / 150`}
          InputProps={{
            sx: {
              bgcolor: isDark ? '#0f172a' : '#f4f4f4',
              borderRadius: 2,
              '& .MuiInputBase-input': { color: isDark ? '#e5e7eb' : '#000' },
            },
          }}
        />



      </Box>

      <Box mt={4}>
        <Typography fontWeight={600} mb={1}>
          Gender
        </Typography>
        <TextField
          fullWidth
          name="gender"
          select
          value={formData.gender}
          onChange={handleChange}
          InputProps={{
            sx: {
              bgcolor: isDark ? '#0f172a' : '#f4f4f4',
              borderRadius: 2,
              '& .MuiInputBase-input': { color: isDark ? '#e5e7eb' : '#000' },
            },
          }}

        >


          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
          <MenuItem value="" disabled>
            Prefer not to say
          </MenuItem>
        </TextField>
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          This won't be part of your public profile.
        </Typography>
      </Box>

      <Box mt={5}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 4, textTransform: 'none', position: 'relative' }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateProfile;
