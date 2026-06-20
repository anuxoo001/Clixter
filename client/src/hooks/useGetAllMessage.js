import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../features/messages/messageSlice";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUserForChat } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!selectedUserForChat?._id) return; 

    const fetchAllMessage = async () => {
      try {
        const api = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(
          `${api}/api/message/getall/${selectedUserForChat._id}`,
          { withCredentials: true }
        );

        if (res.data.success) {
          const messages = Array.isArray(res.data.messages) ? res.data.messages : [];
          dispatch(setMessages(messages)); 
        } else {
          dispatch(setMessages([])); 
        }
      } catch (error) {
        console.log(error);
        dispatch(setMessages([])); 
      }
    };

    fetchAllMessage();
  }, [selectedUserForChat]);
};

export default useGetAllMessage;
