import { Outlet } from 'react-router-dom';
import Sidebar from '../components/mainLayout/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex-shrink-0 w-64 h-full border-r border-slate-800 bg-slate-950/95">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
