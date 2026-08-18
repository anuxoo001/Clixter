import React from 'react';
import { useSelector } from 'react-redux';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const UserSaved = () => {
  const { userProfile } = useSelector(store => store.user);

  const hasBookmarks = userProfile?.bookmarks && userProfile.bookmarks.length > 0;

  return (
    <div className="p-4">
      {hasBookmarks  ? (
        <div className="grid grid-cols-4 gap-4">
          {userProfile.bookmarks.map((post, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded">
              <img className='h-full w-full object-cover' src={post.media} alt="post" />
              <div className='h-full w-full absolute left-0 top-0 bg-slate-950/50 opacity-0 hover:opacity-100 transition-all duration-[.4s]  text-white flex gap-x-4 items-center justify-center'>
                <div className='text-center'>
                  <FavoriteBorderIcon />
                  <span className='text-sm ml-2'>{post.likes.length}</span>
                </div>
                <div className='text-center'>
                  <ChatBubbleOutlineIcon />
                  <span className='text-sm ml-2'>{post.comments.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg font-medium">No saved posts yet</p>
          <p className="text-sm mt-1">All your saved posts will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default UserSaved;
