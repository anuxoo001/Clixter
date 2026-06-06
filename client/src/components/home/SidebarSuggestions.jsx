import React, { useState , useEffect } from "react";
import axios from "axios";
import defaultLogo from "../../assets/images/defaultlogo.png"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addSuggestionUser, removeSuggestionUser, setAuthUser, setSuggestionUsers } from "../../features/auth/authSlice";
import { toast } from "sonner";



export default function SidebarSuggestions() {
  const { user } = useSelector(store => store.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { suggestionUsers } = useSelector(store => store.auth)
  // const [sideSuggestions, setSideSuggestions] = useState([])
  useEffect(() => {
    const fetchSuggetion = async () =>{
      try {
        const api = import.meta.env.VITE_API || '';
        const res = await axios.get(`${api}/api/user/suggestions`, { withCredentials: true})
        if(res.data.success){
          // setSideSuggestions(res.data?.suggestionUsers)
          dispatch(setSuggestionUsers(res.data?.suggestionUsers))
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchSuggetion()
  },[])

  const followUnfollowHandler = async (authorOfUser) => {
    try {
      const api = import.meta.env.VITE_API || '';
      const res = await axios.get(`${api}/api/user/${authorOfUser?._id}/followunfollow`, {withCredentials:true})
      if (res.data.success) {
        const currentFollowing = user?.following || [];
        const targetUserId = authorOfUser?._id

        const alreadyFollowing = currentFollowing.includes(targetUserId);

        const updatedFollowing = alreadyFollowing
          ? currentFollowing.filter(id => id !== targetUserId)  
          : [...currentFollowing, targetUserId];               

        dispatch(setAuthUser({
          ...user,
          following: updatedFollowing
        }));
        if (!alreadyFollowing) {
          dispatch(removeSuggestionUser(targetUserId));
        } else {
          dispatch(addSuggestionUser(authorOfUser));
        }
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 dark:text-slate-300">Suggested for you</h3>


      {suggestionUsers.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No suggestions available right now.</p>
      ) : (
        suggestionUsers.map((user, i) => (
          <div key={i} className="flex items-center justify-between">
            <div
              onClick={() => navigate(`${user._id}/profile`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gray-500 overflow-hidden">
                <img
                  src={user.profilePicture.link || defaultLogo}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="text-sm text-black dark:text-slate-100 font-medium">{user.userName}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Suggested for you</p>
              </div>

            </div>
            <button
              onClick={() => followUnfollowHandler(user)}
              className="text-blue-400 text-sm"
            >
              Follow
            </button>
          </div>
        ))
      )}
    </div>

  );
}
