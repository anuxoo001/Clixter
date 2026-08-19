import { Outlet } from 'react-router-dom';
import Sidebar from '../components/mainLayout/Sidebar';
import BottomNav from '../components/mainLayout/BottomNav';

export default function MainLayout() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="hidden md:flex flex-shrink-0 w-64 h-full border-r border-slate-800 bg-slate-950/95">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}
