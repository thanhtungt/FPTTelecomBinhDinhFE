import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostAPI } from '../../api/posts';
import type { Post, PostCategory } from '../../types/post';
import { PostTableSkeleton } from '../../components/feedback/Skeleton';
import { POST_CATEGORY_OPTIONS, POST_CATEGORY_LABEL } from '../../constants/posts';
import { formatDate } from '../../utils/format';
import { useToast } from '../../hooks/useToast';

const categoryFilters: Array<{ label: string; value: 'all' | PostCategory }> = [
  { label: 'All', value: 'all' },
  ...POST_CATEGORY_OPTIONS
];

const AdminPostsPage = () => {
  const navigate = useNavigate();
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
        showToast('Unable to load posts', 'error');
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

  const handleDelete = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await PostAPI.remove(post.id);
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      showToast('Post deleted', 'success');
    } catch (error) {
      console.error(error);
      showToast('Unable to delete post', 'error');
    }
  };

  const handleRefresh = () => {
    fetchPosts(category);
  };

  const handleCreateNew = () => {
    navigate('/dashboard/posts/new');
  };

  const handleEdit = (post: Post) => {
    navigate(`/dashboard/posts/${post.id}/edit`);
  };

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Content management</p>
          <h1>Posts</h1>
        </div>
        <button type="button" className="primary-btn" onClick={handleCreateNew}>
          + New Post
        </button>
      </header>

      <div className="filter-group">
        {categoryFilters.map((item) => (
          <button
            key={item.value}
            type="button"
            className={category === item.value ? 'chip active' : 'chip'}
            onClick={() => setCategory(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="posts-panel">
        <div className="posts-panel__controls">
          <input
            type="search"
            placeholder="Search by title"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="ghost-btn" onClick={handleRefresh} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading ? (
          <PostTableSkeleton />
        ) : filteredPosts.length === 0 ? (
          <p className="empty-state">No posts found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <p className="table-subtitle">{item.slug}</p>
                    </td>
                    <td>
                      <span className="table-chip">{POST_CATEGORY_LABEL[item.category as PostCategory] ?? item.category}</span>
                    </td>
                    <td>
                      <small>{formatDate(item.publishedAt)}</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="ghost-btn" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="danger-btn" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                        <button 
                          type="button" 
                          className="ghost-btn" 
                          onClick={() => window.open(`/posts/${item.slug}`, '_blank')}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPostsPage;
