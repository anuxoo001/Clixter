import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Tabs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const { userProfile } = useSelector(store => store.user);
  const {  user } = useSelector(store => store.auth);

  const isOwner = user?.id === userProfile?._id;

  return (
    <div className="mt-10 border-t">
      <div className="flex justify-center gap-12 text-xs font-semibold py-4">
        <button
          onClick={() => {
            setActiveTab('posts');
            navigate('');
          }}
          className={`${activeTab === 'posts' && 'border-b-2 font-bold'}`}
        >
          POSTS
        </button>

        {isOwner && (
          <button
            onClick={() => {
              setActiveTab('saved');
              navigate('saved');
            }}
            className={`${activeTab === 'saved' && 'border-b-2 font-bold'}`}
          >
            SAVED
          </button>
        )}
      </div>
    </div>
  );
};

export default Tabs;
