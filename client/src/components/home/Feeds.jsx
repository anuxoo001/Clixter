import Posts from './Posts';
import { useSelector } from 'react-redux';

const PostSkeleton = () => (
  <div className="animate-pulse glass-card p-4 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-700" />
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-slate-700" />
        <div className="h-2 w-20 rounded bg-slate-800" />
      </div>
    </div>
    <div className="h-[380px] rounded-md bg-slate-800" />
    <div className="space-y-2">
      <div className="h-3 w-40 rounded bg-slate-700" />
      <div className="h-3 w-64 rounded bg-slate-800" />
    </div>
  </div>
);

const Feeds = () => {
  const { posts, loading } = useSelector((store) => store.post);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => <PostSkeleton key={n} />)}
      </div>
    );
  }

  return (
    <div>
      {posts.map((post, i) => (
        <Posts key={i} data={post} />
      ))}
    </div>
  );
};

export default Feeds;