import { useEffect } from "react";
import apiClient from "../services/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../features/messages/messageSlice";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUserForChat } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!selectedUserForChat?._id) return; 

    const fetchAllMessage = async () => {
      try {
        const res = await apiClient.get(
          `/api/message/getall/${selectedUserForChat._id}`
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
