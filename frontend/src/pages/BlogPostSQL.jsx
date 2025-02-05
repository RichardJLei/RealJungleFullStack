import { getBlogPostsSQL } from '../services/BlogPostService';

export default function BlogPostSQL() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    getBlogPostsSQL().then(data => {
      console.log('Fetched posts:', data);
      setPosts(data);
    });
  }, []);

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
} 