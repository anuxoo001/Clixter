import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

export default function Search() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(
        `${api}/api/user/${query}/searchprofile`,
        { withCredentials: true }
      );
      setResults(res.data.users);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const shouldShowIcon =
    query.trim().length === 0 && !loading && results.length === 0;

  return (
    <div className="relative p-4 max-w-xl mx-auto min-h-[60vh] flex flex-col items-center justify-start">
      <div className="relative mb-4 w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 pr-10 border rounded-md outline-none bg-white dark:bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.select();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 focus:outline-none"
          >
            &#x2715;
          </button>
        )}
      </div>

      {shouldShowIcon && (
        <div className="flex  flex-1 flex-col items-center justify-center mt-10 opacity-30 transition-opacity duration-300">
          <SearchIcon style={{ fontSize: 120 }} className="text-slate-300" />
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Start typing to search users</p>
        </div>
      )}

      {loading && <p className="text-slate-600 dark:text-slate-400 mt-4">Searching...</p>}

      <div className="flex flex-col gap-3 w-full mt-4">
        {query.length > 0 && query.length < 3 && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Enter at least 3 characters to search</p>
        )}

        {!loading && results.length === 0 && query.length >= 3 && (
          <p className="text-slate-600 dark:text-slate-400">No users found</p>
        )}

        {results.map((user) => (
          <div
            onClick={() => navigate(`/${user._id}/profile`)}
            key={user._id}
            className="flex items-center gap-3 p-3 cursor-pointer bg-white dark:bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition"
          >
            {user?.profilePicture?.link ? (
              <img
                src={user.profilePicture.link}
                alt={user.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Avatar
                sx={{ bgcolor: "#3f51b5", width: 40, height: 40, fontSize: 16 }}
              >
                {user.userName?.[0]?.toUpperCase() || "?"}
              </Avatar>
            )}
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{user.userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.fullName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
