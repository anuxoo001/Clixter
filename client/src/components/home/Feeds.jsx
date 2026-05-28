import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Posts from './Posts';
import { useSelector } from 'react-redux';

const Feeds = () => {
  const [loading, setLoading] = useState(true);
  const {posts} = useSelector(store => store.post)

  return (
    <div>
      {loading && <p>Loading posts...</p>}

      {posts.map(( post , i) => (
        <Posts key={i} data={post} />
      ))}
    </div>
  );
};

export default Feeds;
