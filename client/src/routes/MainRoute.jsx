import { Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import ProtectedRoute from './ProtectedRoute';
import MessageLayout from '../layouts/MessageLayout';
import Chat from '../features/messages/pages/Chat';
import StartChat from '../features/messages/pages/StartChat';
import ProfileLayout from '../layouts/ProfileLayout';
import UserPosts from '../features/profile/components/UserPosts';
import UserSaved from '../features/profile/components/UserSaved';
import Search from '../features/search/pages/Search';
import UpdateProfile from '../features/profile/pages/UpdateProfile';
import Reels from '../features/posts/pages/Reels';
import Notifications from '../features/notifications/pages/Notifications';


const MainRoute = () => ([
    <Route 
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
      <Route path="/" element={<Home />} />
      <Route path="/reels" element={<Reels />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/search" element={<Search />} />
      <Route path=":id/updateprofile" element={<UpdateProfile />} />
      <Route path=":id/profile" element={<ProfileLayout />}>
        <Route index element={<UserPosts />} />
        <Route path="saved" element={<UserSaved />} />
      </Route>
      <Route path="/inbox" element={<MessageLayout />}>
        <Route index element={<StartChat />} />
        <Route path=":id/chat" element={<Chat />} />
      </Route>
    </Route>
]);

export default MainRoute;
