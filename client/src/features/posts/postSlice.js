import { createSlice } from "@reduxjs/toolkit"

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts:[],
        selectedPost:null
    },
    reducers: {
        setPosts: (state , action) => {
            state.posts = action.payload
        },
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload
        }
        ,updatePostReactions: (state, action) => {
            const { postId, reactions } = action.payload;
            state.posts = state.posts.map(p => p._id === postId ? { ...p, reactions } : p);
            if (state.selectedPost && state.selectedPost._id === postId) {
                state.selectedPost = { ...state.selectedPost, reactions };
            }
        }
    }
})

export const { setPosts, setSelectedPost, updatePostReactions } = postSlice.actions
export default postSlice.reducer