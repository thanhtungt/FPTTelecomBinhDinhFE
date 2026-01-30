import { useCallback, useEffect, useMemo, useState } from 'react';
import { PostAPI } from '../api/posts';
import type { Post, PostCategory } from '../types/post';
import PostCard from '../components/cards/PostCard';
import { PostCardSkeleton } from '../components/feedback/Skeleton';
import { POST_CATEGORY_OPTIONS } from '../constants/posts';
import { useToast } from '../hooks/useToast';

const filterOptions: Array<{ label: string; value: 'all' | PostCategory }> = [
  { label: 'All', value: 'all' },
  ...POST_CATEGORY_OPTIONS
];

const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'all' | PostCategory>('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchPosts = useCallback(
    async (categoryValue: 'all' | PostCategory) => {
      setLoading(true);
      try {
        const data = await PostAPI.getAll(categoryValue === 'all' ? undefined : categoryValue);
        setPosts(data);
      } catch (error) {
        console.error(error);
        showToast('Unable to load stories', 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchPosts(category);
  }, [category, fetchPosts]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return posts;
    return posts.filter((item) => item.title.toLowerCase().includes(keyword));
  }, [posts, search]);

  const title = useMemo(() => filterOptions.find((item) => item.value === category)?.label ?? 'Stories', [category]);

  return (
    <div className="page posts-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Stories</p>
          <h1>{title} from FPT team.</h1>
        </div>
        <div className="posts-page__controls">
          <div className="filter-group">
            {filterOptions.map((item) => (
              <button key={item.value} className={category === item.value ? 'chip active' : 'chip'} onClick={() => setCategory(item.value)}>
                {item.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search title..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </header>
      {loading ? (
        <div className="grid two">
          {Array.from({ length: 4 }).map((_, idx) => (
            <PostCardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <p className="empty-state">No stories match your search.</p>
      ) : (
        <div className="grid two">
          {filteredPosts.map((item) => (
            <PostCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
