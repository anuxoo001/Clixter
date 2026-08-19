import { useEffect } from "react"
import apiClient from "../services/apiClient"
import { useDispatch } from "react-redux"
import { setPosts, setPostsLoading } from "../features/posts/postSlice"

const useGetAlPosts = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        dispatch(setPostsLoading(true));
        const res = await apiClient.get('/api/post/getallposts');
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setPostsLoading(false));
      }
    };
    fetchAllPost();
  }, [dispatch]);
}

export default useGetAlPosts