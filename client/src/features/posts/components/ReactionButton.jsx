import React, { useState, useEffect } from 'react';

export default function ReactionButton({ postId, userId }) {
  const [count, setCount] = useState(0);
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/reaction/${postId}`);
        const data = await res.json();
        setCount(data.reactions.length || 0);
        const mine = data.reactions.find(r => r.userId === userId);
        if (mine) setUserReaction(mine.type);
      } catch (e) {
        // ignore
      }
    };
    fetchReactions();
  }, [postId, userId]);

  const toggleLike = async () => {
    try {
      if (userReaction) {
        // remove reaction
        await fetch(`/api/reaction/${postId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
        setUserReaction(null);
        setCount(c => Math.max(0, c - 1));
        return;
      }
      const res = await fetch(`/api/reaction/${postId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, type: 'like' }) });
      if (res.ok) {
        setUserReaction('like');
        setCount(c => c + 1);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <button onClick={toggleLike} className={`px-2 py-1 rounded ${userReaction ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
      👍 {count}
    </button>
  );
}
