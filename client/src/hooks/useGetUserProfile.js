import { useEffect } from "react";
import apiClient from "../services/apiClient";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../features/profile/userSlice";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await apiClient.get(`/api/user/${userId}/profile`);
        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
        } else {
          console.log(res);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;

