
import Feeds from "../components/home/Feeds";
import Posts from "../components/home/Posts";
import SidebarSuggestions from "../components/home/SidebarSuggestions";
import Stories from "../components/home/Stories";
import Suggestions from "../components/home/Suggestions";
import useGetAlPosts from "../hooks/useGetAllPosts";

export default function InstagramMock() {
  useGetAlPosts()
  return (

    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 px-10 py-[2rem] gap-4">
      <div className="flex-1 max-w-2xl space-y-4">
        <Stories />
        <Feeds />
      </div>

      <div className="hidden md:block w-80">
        <SidebarSuggestions />
      </div>
    </div>
  );
}
