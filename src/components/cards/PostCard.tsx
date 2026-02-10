import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';
import { formatDate } from '../../utils/format';

interface PostCardProps {
  item: Post;
}

const PostCard = ({ item }: PostCardProps) => (
  <article className="post-card">
    <div className="post-card__body">
      <p className="post-card__category">{item.category}</p>
      <h3>{item.title}</h3>
      <p className="post-card__date">{formatDate(item.publishedAt)}</p>
      <p className="post-card__excerpt">{item.content.replace(/<[^>]*>/g, '').slice(0, 120)}...</p>
    </div>
    <Link to={`/posts/${item.slug}`} className="ghost-btn">
      Đọc tin tức →
    </Link>
  </article>
);

export default PostCard;
