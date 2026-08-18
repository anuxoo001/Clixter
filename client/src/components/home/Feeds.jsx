import Posts from './Posts';
import { useSelector } from 'react-redux';

const Feeds = () => {
  const {posts} = useSelector(store => store.post)

  return (
    <div>
      {posts.map(( post , i) => (
        <Posts key={i} data={post} />
      ))}
    </div>
  );
};

export default Feeds;
