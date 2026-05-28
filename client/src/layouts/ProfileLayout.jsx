import { Outlet } from "react-router-dom";
import ProfileHeader from "../features/profile/components/ProfileHeader";
import Highlights from "../features/profile/components/Highlights";
import Tabs from "../features/profile/components/ProfileTabs";

export default function ProfileLayout() {

  return (
    <div className="w-full px-4 py-10 mx-auto max-w-7xl">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.9)] ring-1 ring-white/10 backdrop-blur-xl">
        <ProfileHeader />
        <Highlights />
        <Tabs />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
