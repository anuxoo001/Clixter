import apiClient from "../../../services/apiClient";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  setMessages } from "../messageSlice";
import useGetAllMessage from "../../../hooks/useGetAllMessage";
import defaultlogo from "../../../assets/images/defaultlogo.png";
import useGetRTM from "../../../hooks/useGetRTM";

export default function Chat() {
  useGetAllMessage();

  const dispatch = useDispatch();
  const [messageText, setMessageText] = useState('');

  const { messages, unSeenMessages } = useSelector((store) => store.message);
  const { selectedUserForChat, user } = useSelector((store) => store.auth);

  const bottomRef = useRef(null);

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(
        `/api/message/send/${selectedUserForChat?._id}`,
        { messageText },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setMessageText('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, unSeenMessages]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);

    const diffInSeconds = Math.floor((now - past) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const timePart = `${formattedMinutes}:${formattedSeconds}`;

    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pastDate = new Date(past.getFullYear(), past.getMonth(), past.getDate());

    const dayDiff = Math.floor((nowDate - pastDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      return `Today ${timePart}`;
    } else if (dayDiff === 1) {
      return `Yesterday ${timePart}`;
    } else {
      const day = String(past.getDate()).padStart(2, '0');
      const month = String(past.getMonth() + 1).padStart(2, '0');
      const year = past.getFullYear();
      return `${day}/${month}/${year} ${timePart}`;
    }
  };



  return (
    <div className="relative flex-1 flex flex-col h-screen bg-white text-black dark:bg-slate-950 dark:text-slate-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800 dark:bg-slate-950">

        <div className="flex items-center gap-3">
          <img
            src={selectedUserForChat?.profilePicture?.link || defaultlogo}
            className="w-10 h-10 rounded-full"
            alt="user"
          />

          <div>
            <p className="font-medium">
              {selectedUserForChat?.fullName} <span className="text-blue-500">✔</span>
            </p>
            <p className="text-xs text-gray-400">
              {selectedUserForChat?.userName} · Clixter
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-y-scroll pb-[4rem]">
        <div className="flex flex-col items-center mt-8 text-black">
          <img
            src={selectedUserForChat?.profilePicture?.link || defaultlogo}
            className="w-24 h-24 rounded-full"
            alt="user"
          />
          <p className="text-lg font-bold mt-2">
            {selectedUserForChat?.fullName} <span className="text-blue-500">✔</span>
          </p>
          <p className="text-sm text-gray-400">{selectedUserForChat?.userName} · Clixter</p>
          <button className="mt-4 px-4 py-1 bg-gray-200 rounded text-sm">View Profile</button>
        </div>

        {/* <div className="text-xs text-center text-gray-600 my-4">01:11</div> */}

        {messages &&
          messages.map((message, i) => (
            <div
              key={i}
              className={`${
                message?.senderId === user?.id ? "justify-end" : " justify-start"
              } py-2 px-6 w-full flex items-end` }
            >
              {message?.senderId === user?.id && <span className=" text-xs opacity-[.3]">{formatTimeAgo(message?.createdAt)}</span>}
              <span
                className={`${
                  message?.senderId === user?.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                } px-3 py-2 rounded-full text-sm`}
              >
                {message?.message}
              </span>
              {message?.senderId !== user?.id && <span className=" text-xs opacity-[.3]">{formatTimeAgo(message?.createdAt)}</span>}
            </div>
          ))}

        {/* {unSeenMessages?.some(
          (msg) => msg.senderId === selectedUserForChat?._id
        ) && (
          <>
            <div className="text-center text-gray-400 text-xs my-4">
              Unseen Messages
            </div>

            {unSeenMessages
              .filter((msg) => msg.senderId === selectedUserForChat?._id)
              .map((message, i) => (
                <div
                  key={`unseen-${i}`}
                  className="text-left py-2 px-6"
                >
                  <span className="bg-yellow-100 text-black px-3 py-2 rounded-full text-sm">
                    {message.message}
                  </span>
                </div>
              ))}
          </>
        )} */}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessageHandler} className="absolute left-0 bottom-0 border-t bg-white shadow-lg border-gray-200 p-3 flex items-center w-full text-black dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800">

        {/* <button className="text-xl px-2">😊</button> */}
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="bg-transparent flex-1 px-3 py-2 outline-none text-sm"
          placeholder="Message..."
        />
        <button
          onClick={sendMessageHandler}
          className="text-sm text-blue-500 font-semibold px-3"
        >
          Send
        </button>
      </form>
    </div>
  );
}
