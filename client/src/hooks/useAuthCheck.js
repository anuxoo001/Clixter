import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import apiClient from "../services/apiClient";
import { setAuthUser } from "../features/auth/authSlice";

export default function useAuthCheck() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await apiClient.get('/api/user/me');

        if (res.data.success) {
          setIsAuthenticated(true);
          if (res.data.user) {
            dispatch(setAuthUser(res.data.user));
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || "Authentication check failed";

        if (status && status !== 401 && status !== 403) {
          toast.error(message);
        }

        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true); // Mark that check has completed
      }
    };

    verifyUser();
  }, []);

  return { isAuthenticated, authChecked };
}
