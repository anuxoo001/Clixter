import { useEffect } from "react"
import axios from "axios"
import { useDispatch } from "react-redux"
import { setPosts } from "../features/posts/postSlice"

const useGetAlPosts = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const api = import.meta.env.VITE_API_URL || '';
                const res = await axios.get(`${api}/api/post/getallposts`, {withCredentials: true})
                if(res.data.success) {
                    dispatch(setPosts(res.data.posts))
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchAllPost()
    }, [])
}

export default useGetAlPosts