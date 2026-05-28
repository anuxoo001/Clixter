import { useState } from "react";
import { Outlet } from "react-router-dom";
import Inbox from "../features/messages/components/Inbox";

export default function MessageLayout() {
  const [activeChat, setActiveChat] = useState(true);

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      <div className="w-[300px] h-full flex-shrink-0  top-0 border-r border-gray-200 overflow-y-auto">
        <Inbox />
      </div>

      <div className="flex-1 h-full overflow-y-auto flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
