import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:'auth',
    initialState: {
        user: null,
        suggestionUsers: [],
        selectedUserForChat: null,
        bookmarks:[]
    },
    reducers:{
        //actions
        setAuthUser:(state ,action) =>{
            state.user = action.payload
        },
        setSuggestionUsers: (state, action) => {
            state.suggestionUsers = action.payload
        },
        setSelestedUserForChat: (state, action) => {
            state.selectedUserForChat = action.payload
        },
        setBookMarks: (state, action) => {
            state.bookmarks = action.payload
        },
        removeSuggestionUser: (state, action) => {
            state.suggestionUsers = state.suggestionUsers.filter(
                user => user._id !== action.payload
            );
        },
        addSuggestionUser: (state, action) => {
            const exists = state.suggestionUsers.some(user => user._id === action.payload._id);
            if (!exists) {
                state.suggestionUsers.push(action.payload);
            }
        }

    }
})

export const {setAuthUser, setSuggestionUsers ,setSelestedUserForChat, setBookMarks, removeSuggestionUser, addSuggestionUser} = authSlice.actions
export default authSlice.reducer