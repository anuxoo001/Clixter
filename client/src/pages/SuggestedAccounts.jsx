import React, { useEffect } from "react";
import defaultLogo from "../assets/images/defaultlogo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addSuggestionUser, removeSuggestionUser, setAuthUser, setSuggestionUsers } from "../features/auth/authSlice";
import apiClient from "../services/apiClient";
import { toast } from "sonner";

export default function SuggestedAccounts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, suggestionUsers } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await apiClient.get("/api/user/suggestions");
        if (res.data.success) {
          dispatch(setSuggestionUsers(res.data?.suggestionUsers));
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (suggestionUsers.length === 0) fetchSuggestions();
  }, [dispatch]);

  const followUnfollowHandler = async (target) => {
    try {
      const res = await apiClient.get(`/api/user/${target?._id}/followunfollow`);
      if (res.data.success) {
        const targetUserId = target?._id;
        const alreadyFollowing = (user?.following || []).includes(targetUserId);
        const updatedFollowing = alreadyFollowing
          ? user.following.filter((id) => id !== targetUserId)
          : [...(user.following || []), targetUserId];

        dispatch(setAuthUser({ ...user, following: updatedFollowing }));
        if (!alreadyFollowing) {
          dispatch(removeSuggestionUser(targetUserId));
        } else {
          dispatch(addSuggestionUser(target));
        }
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Suggested for you</h1>

      {suggestionUsers.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✨</div>
          <p className="text-lg font-semibold text-white">No suggestions right now</p>
          <p className="text-sm text-white/50 mt-1">
            Follow more people to get better recommendations.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestionUsers.map((suggested) => {
            const alreadyFollowing = (user?.following || []).includes(suggested._id);
            return (
              <div
                key={suggested._id}
                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-slate-900/60"
              >
                <div
                  onClick={() => navigate(`${suggested._id}/profile`)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={suggested.profilePicture?.link || defaultLogo}
                      alt={suggested.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{suggested.userName}</p>
                    <p className="text-xs text-white/50">{suggested.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => followUnfollowHandler(suggested)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    alreadyFollowing
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white shadow-lg shadow-sky-500/20"
                  }`}
                >
                  {alreadyFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}