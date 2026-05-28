import { Outlet } from 'react-router-dom';
import Footer from '../components/authLayout/Footer';


export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col justify-between items-center">
        <main className="p-4">
          <Outlet />
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  );
}
