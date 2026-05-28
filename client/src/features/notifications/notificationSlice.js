import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: 'realTimeNotification',
    initialState:{
        likeNotification: [],
        followNotification: []
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
        clearNotifications: (state) => {
            state.likeNotification = [];
            state.followNotification = [];
        },
    }
})
export const {setLikeNotification, setFollowNotification, clearNotifications} = notificationSlice.actions;
export default notificationSlice.reducer;

