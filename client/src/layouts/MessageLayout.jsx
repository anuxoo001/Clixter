import { Outlet } from "react-router-dom";
import Inbox from "../features/messages/components/Inbox";

export default function MessageLayout() {

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black dark:bg-slate-950 dark:text-slate-100">
      <div className="w-[300px] h-full flex-shrink-0 top-0 border-r border-gray-200 overflow-y-auto dark:border-slate-800 dark:bg-slate-950/95">
        <Inbox />
      </div>

      <div className="flex-1 h-full overflow-y-auto flex flex-col dark:bg-slate-950">
        <Outlet />
      </div>
    </div>
  );
}

