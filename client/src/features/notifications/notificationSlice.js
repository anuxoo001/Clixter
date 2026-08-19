import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: 'realTimeNotification',
    initialState:{
        likeNotification: [],
        followNotification: [],
        commentNotification: []
    },
    reducers:{
        setLikeNotification:(state, action) =>{
            if(action.payload.type === 'like'){
                state.likeNotification.push(action.payload)
            }else if(action.payload.type === 'dislike'){
                state.likeNotification = state.likeNotification.filter((notification) => notification.userId !== action.payload.userId)
            }
        },
        setFollowNotification:(state, action) => {
            if(action.payload.type === 'follow'){
                state.followNotification.push(action.payload)
            }else if(action.payload.type === 'unfollow'){
                state.followNotification = state.followNotification.filter((notification) => notification.userId !== action.payload.userId)
            }
        },
        setCommentNotification:(state, action) => {
            if(action.payload.type === 'comment'){
                state.commentNotification.push(action.payload)
            }
        },
        clearNotifications: (state) => {
            state.likeNotification = [];
            state.followNotification = [];
            state.commentNotification = [];
        },
    }
})
export const {setLikeNotification, setFollowNotification, setCommentNotification, clearNotifications} = notificationSlice.actions;
export default notificationSlice.reducer;

