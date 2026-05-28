import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Posts from './Posts';
import { useSelector } from 'react-redux';

const Feeds = () => {
  // const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {posts} = useSelector(store => store.post)

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const res = await axios.get('http://localhost:5000/api/post/getallposts', {
  //         withCredentials: true,
  //       });

  //       if (res.data.success) {
  //         setPosts(res.data.posts);
  //       } 
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPosts();
  // }, []);

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
