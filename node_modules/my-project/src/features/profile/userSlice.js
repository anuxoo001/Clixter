import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:'user',
    initialState: {
        userProfile: null
    },
    reducers:{
        //actions
        setUserProfile:(state ,action) =>{
            state.userProfile = action.payload
        }
    }
})

export const {setUserProfile} = userSlice.actions
export default userSlice.reducer