import React from 'react';
import ProfileHeader from '../components/ProfileHeader';
import Highlights from '../components/Highlights';
import ProfileTabs from '../components/ProfileTabs';
import EmptyPosts from '../components/EmptyPosts';

const Profile = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <ProfileHeader />
      <Highlights />
      <ProfileTabs />
      <EmptyPosts />
    </div>
  );
};

export default Profile;
