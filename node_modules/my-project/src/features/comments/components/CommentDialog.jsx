import { useState , useEffect } from 'react';
import { Dialog, Button } from '@mui/material';
import defaultLogo from "../../../assets/images/defaultlogo.png";
import {

  IconButton,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts, setSelectedPost } from '../../posts/postSlice';
import { toast } from 'sonner';


export default function CommentDialog({open , handleClose }) {
    const dispatch = useDispatch()
    const {user} = useSelector(store=> store.auth)
    const {selectedPost} = useSelector(store => store.post)
    const {posts} = useSelector(store => store.post) 
    const api = import.meta.env.VITE_API || '';
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState("")

    useEffect(() => {
        if(selectedPost) {
            setComments(selectedPost.comments)
        }
    },[selectedPost])

    const commentHandler = async (e) => {
      e.preventDefault();
        try {
        const res = await axios.post(`${api}/api/post/${selectedPost?._id}/addcomment`, {commentText} , {
            headers: {
            "Content-Type" : 'application/json'
            },
            withCredentials: true
        } )
        if(res.data.success) {
            const updatedComments = [...comments , res.data.comment]
            setComments(updatedComments);
            const updatedPosts = posts.map(post =>
            post._id === selectedPost._id ? {...post, comments: updatedComments} : post
            )
            dispatch(setPosts(updatedPosts))
            toast.success(res.data.message)
            }
        } catch (error) {
         console.log(error)
        } finally {
         setCommentText("")
        }
    }

    return (
       <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          className: "h-[90vh] rounded-lg overflow-hidden",
        }}
      >
        <div className="flex h-full w-full">
          {/* Left - Image */}
          <div className="w-1/2 bg-black flex items-center justify-center overflow-hidden">
            <img
              src={selectedPost?.media || null}
              alt="Post"
              className="h-full w-full object-contain"
            />
          </div>


          <div className="w-1/2 bg-white flex flex-col justify-between">
            <div className="p-4 border-b border-gray-300 flex items-center justify-between gap-3">
              <div  
                onClick={() => navigate(`${selectedPost?.author._id}/profile`)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={selectedPost?.author.profilePicture?.link || defaultLogo}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <p className="text-sm font-semibold">
                  {selectedPost?.author?.userName}
                </p>
              </div>
               <IconButton>
                <MoreHorizIcon className="text-gray-500" />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.map((comment, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.author?.profilePicture?.link || defaultLogo}
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <p className="text-sm font-semibold">
                      {comment.author?.userName} .
                    </p>
                    <p className="text-sm ml-1">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={commentHandler} className="border-t border-gray-300 p-3 flex items-center">
              <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
                type="text"
                placeholder="Add a comment..."
                className="flex-1 outline-none text-sm px-2"
              />
              <Button onClick={commentHandler} variant="text" size="small">
                Send
              </Button>
            </form>
          </div>
        </div>
      </Dialog>
    )
}