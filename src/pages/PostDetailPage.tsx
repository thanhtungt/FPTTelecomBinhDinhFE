import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Post } from '../types/post';
import { PostAPI } from '../api/posts';
import { formatDate } from '../utils/format';
import PostCard from '../components/cards/PostCard';
import { PostCardSkeleton, PostDetailSkeleton } from '../components/feedback/Skeleton';
import { useToast } from '../hooks/useToast';

const PostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadPost = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const article = await PostAPI.getBySlug(slug);
      const others = await PostAPI.getAll(article.category);
      setPost(article);
      setRelated(others.filter((item) => item.id !== article.id).slice(0, 3));
    } catch (err) {
      console.error(err);
      setPost(null);
      setRelated([]);
      setError('Unable to load this article.');
      showToast('Unable to load article', 'error');
    } finally {
      setLoading(false);
    }
  }, [slug, showToast]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  return (
    <div className="page post-detail">
      <button className="ghost-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {loading ? (
        <>
          <PostDetailSkeleton />
          <div className="grid three">
            {Array.from({ length: 3 }).map((_, idx) => (
              <PostCardSkeleton key={idx} />
            ))}
          </div>
        </>
      ) : error || !post ? (
        <div className="empty-state stack">
          <p>{error ?? 'Article not found.'}</p>
          <div className="hero__actions">
            <button className="ghost-btn" onClick={loadPost}>
              Retry
            </button>
            <button className="primary-btn" onClick={() => navigate('/posts')}>
              Back to stories
            </button>
          </div>
        </div>
      ) : (
        <>
          <article className="post-detail__article">
            <p className="eyebrow">{post.category}</p>
            <h1>{post.title}</h1>
            <p className="post-card__date">{formatDate(post.publishedAt)}</p>
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="post-detail__image" />}
            <div className="post-detail__content">
              {post.content.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </article>

          {related.length > 0 && (
            <section>
              <h3>More stories</h3>
              <div className="grid three">
                {related.map((item) => (
                  <PostCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default PostDetailPage;
