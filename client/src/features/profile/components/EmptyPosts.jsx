import React from 'react';

const EmptyPosts = () => {
  return (
    <div className="flex flex-col items-center mt-20">
      <div className="text-4xl mb-4">📷</div>
      <h2 className="font-bold text-lg">Share photos</h2>
      <p className="text-sm mt-1">When you share photos, they will appear on your profile.</p>
      <button className="text-blue-500 mt-2 text-sm font-semibold">Share your first photo</button>
    </div>
  );
};

export default EmptyPosts;
