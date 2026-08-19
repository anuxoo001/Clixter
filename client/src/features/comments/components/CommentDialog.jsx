import { useState , useEffect } from 'react';
import { Dialog, Button } from '@mui/material';
import defaultLogo from "../../../assets/images/defaultlogo.png";
import {
  IconButton,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '../../posts/postSlice';
import { toast } from 'sonner';
import apiClient from '../../../services/apiClient';



export default function CommentDialog({open , handleClose }) {
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const {user} = useSelector(store=> store.auth)
    const {selectedPost} = useSelector(store => store.post)
    const {posts} = useSelector(store => store.post) 
    const [comments, setComments] = useState([])
    const reactionEmojis = ['❤️','😂','😮','😢','👏'];
    const [commentText, setCommentText] = useState("")

    useEffect(() => {
        if(selectedPost) {
            setComments(selectedPost.comments)
        }
    },[selectedPost])

    const commentHandler = async (e) => {
      e.preventDefault();
        try {
        const res = await apiClient.post(`/api/post/${selectedPost?._id}/addcomment`, { commentText });
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
                onClick={() => {
                  const authorId = selectedPost?.author?._id;
                  if (authorId) navigate(`/${authorId}/profile`);
                }}
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
              {comments.map((comment, index) => {
                const commentId = comment?._id;
                const isMyComment = user?.id && comment?.author?._id && (comment.author._id.toString() === user.id.toString());

                return (
                  <div key={index}>
                    <div className="flex items-center gap-3">
                      <img
                        src={comment.author?.profilePicture?.link || defaultLogo}
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{comment.author?.userName} .</p>
                        </div>
                        <p className="text-sm ml-1">{comment.text}</p>

                        {isMyComment && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => {
                                const newText = prompt('Edit comment', comment.text);
                                if (!newText || !newText.trim()) return;
                                (async () => {
                                  try {
                                    const res = await apiClient.patch(
                                      `/api/post/${selectedPost?._id}/comment/${commentId}`,
                                      { commentText: newText }
                                    );
                                    if (res.data.success) {
                                      const updatedComments = comments.map((c) =>
                                        c._id === commentId ? { ...c, text: newText, reactions: c.reactions } : c
                                      );
                                      setComments(updatedComments);
                                      dispatch(
                                        setPosts(
                                          posts.map((p) =>
                                            p._id === selectedPost._id
                                              ? { ...p, comments: updatedComments }
                                              : p
                                          )
                                        )
                                      );
                                    }
                                  } catch (e) {
                                    console.log(e);
                                  }
                                })();
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              variant="text"
                              size="small"
                              color="error"
                              onClick={() => {
                                if (!window.confirm('Delete this comment?')) return;
                                (async () => {
                                  try {
                                    const res = await apiClient.delete(
                                      `/api/post/${selectedPost?._id}/comment/${commentId}`
                                    );
                                    if (res.data.success) {
                                      const updatedComments = comments.filter((c) => c._id !== commentId);
                                      setComments(updatedComments);
                                      dispatch(
                                        setPosts(
                                          posts.map((p) =>
                                            p._id === selectedPost._id
                                              ? { ...p, comments: updatedComments }
                                              : p
                                          )
                                        )
                                      );
                                    }
                                  } catch (e) {
                                    console.log(e);
                                  }
                                })();
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}

                        {/* Emoji reactions (comment) */}
                        <div className="mt-2 flex items-center gap-2">
                          {reactionEmojis.map((emoji) => {
                            const reaction = comment?.reactions?.find((r) => r.emoji === emoji);
                            const users = reaction?.users || [];
                            const count = users.length;
                            const reactedByMe = users.some((id) => id === user?.id || id?._id === user?.id);

                            return (
                              <button
                                key={emoji}
                                onClick={async () => {
                                  if (!commentId) return;
                                  try {
                                    const res = await apiClient.post(
                                      `/api/post/comment/${commentId}/react`,
                                      { emoji }
                                    );
                                    if (res.data.success) {
                                      const updatedComments = comments.map((c) =>
                                        c._id === commentId ? { ...c, reactions: res.data.reactions } : c
                                      );
                                      setComments(updatedComments);
                                      dispatch(
                                        setPosts(
                                          posts.map((p) =>
                                            p._id === selectedPost._id
                                              ? { ...p, comments: updatedComments }
                                              : p
                                          )
                                        )
                                      );
                                    }
                                  } catch (e) {
                                    console.log(e);
                                  }
                                }}
                                className={`text-xs px-2 py-1 rounded-full border transition ${reactedByMe ? 'bg-red-100 border-red-400' : 'border-zinc-700 bg-transparent hover:bg-zinc-800/40'}`}
                                title="React"
                              >
                                <span className="text-base">{emoji}</span>
                                <span className="ml-1 text-[11px] opacity-80">{count ? count : ''}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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