import { useCallback, useEffect, useMemo, useState } from 'react';
import { PostAPI } from '../../api/posts';
import type { Post, PostCategory, PostPayload } from '../../types/post';
import PostEditorForm from '../../components/forms/PostEditorForm';
import { PostTableSkeleton } from '../../components/feedback/Skeleton';
import { POST_CATEGORY_OPTIONS, POST_CATEGORY_LABEL } from '../../constants/posts';
import { formatDate } from '../../utils/format';
import { useToast } from '../../hooks/useToast';

const categoryFilters: Array<{ label: string; value: 'all' | PostCategory }> = [
  { label: 'All', value: 'all' },
  ...POST_CATEGORY_OPTIONS
];

const AdminPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'all' | PostCategory>('all');
  const [search, setSearch] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

  const currentInitialValues: PostPayload | undefined = editingPost
    ? {
        title: editingPost.title,
        category: POST_CATEGORY_OPTIONS.some((option) => option.value === editingPost.category)
          ? (editingPost.category as PostCategory)
          : 'tin-tuc',
        content: editingPost.content,
        imageUrl: editingPost.imageUrl ?? undefined
      }
    : undefined;

  const handleSubmit = async (values: PostPayload) => {
    console.log('[AdminPostsPage] handleSubmit called with:', values);
    setSubmitting(true);
    try {
      if (editingPost) {
        console.log('[AdminPostsPage] Updating post:', editingPost.id);
        const updated = await PostAPI.update(editingPost.id, values);
        console.log('[AdminPostsPage] Update response:', updated);
        setPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast('Post updated', 'success');
      } else {
        console.log('[AdminPostsPage] Creating new post');
        const created = await PostAPI.create(values);
        console.log('[AdminPostsPage] Create response:', created);
        setPosts((prev) => [created, ...prev]);
        showToast('Post published', 'success');
      }
      setEditingPost(null);
    } catch (error) {
      console.error('[AdminPostsPage] Error:', error);
      showToast('Unable to save post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (post: Post) => {
    const confirmed = window.confirm(`Delete "${post.title}"?`);
    if (!confirmed) return;
    try {
      await PostAPI.remove(post.id);
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      if (editingPost?.id === post.id) setEditingPost(null);
      showToast('Post deleted', 'success');
    } catch (error) {
      console.error(error);
      showToast('Unable to delete post', 'error');
    }
  };

  const handleRefresh = () => fetchPosts(category);

  return (
    <div className="page dashboard-page posts-dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Content</p>
          <h1>Post operations</h1>
        </div>
        <div className="filter-group">
          {categoryFilters.map((item) => (
            <button key={item.value} className={category === item.value ? 'chip active' : 'chip'} onClick={() => setCategory(item.value)}>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="dashboard-grid">
        <PostEditorForm
          initialValues={currentInitialValues}
          isEditing={Boolean(editingPost)}
          onSubmit={handleSubmit}
          submitting={submitting}
          onCancelEdit={() => setEditingPost(null)}
        />

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
                          <button type="button" className="ghost-btn" onClick={() => setEditingPost(item)}>
                            Edit
                          </button>
                          <button type="button" className="danger-btn" onClick={() => handleDelete(item)}>
                            Delete
                          </button>
                          <a href={`/posts/${item.slug}`} target="_blank" rel="noreferrer" className="text-link">
                            View ↗
                          </a>
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
    </div>
  );
};

export default AdminPostsPage;
