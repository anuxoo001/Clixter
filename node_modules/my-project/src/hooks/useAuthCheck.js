import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function useAuthCheck() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const api = import.meta.env.VITE_API || '';
        const res = await axios.get(`${api}/api/user/me`, {
          withCredentials: true,
        });


        if (res.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || "Authentication check failed";
        toast.error(message);
        setIsAuthenticated(false);
      } finally {

        setAuthChecked(true); // Mark that check has completed
      }
    };

    verifyUser();
  }, []);

  return { isAuthenticated, authChecked };
}
