import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PostAPI } from '../../api/posts';
import type { Post, PostCategory, PostPayload } from '../../types/post';
import PostEditorForm from '../../components/forms/PostEditorForm';
import { POST_CATEGORY_OPTIONS } from '../../constants/posts';
import { useToast } from '../../hooks/useToast';

const AdminPostEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await PostAPI.getById(parseInt(id, 10));
        setPost(data);
      } catch (error) {
        console.error('[AdminPostEditorPage] Error fetching post:', error);
        showToast('Không thể tải bài viết', 'error');
        navigate('/dashboard/posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, showToast, navigate]);

  const initialValues: PostPayload | undefined = post
    ? {
        title: post.title,
        category: POST_CATEGORY_OPTIONS.some((option) => option.value === post.category)
          ? (post.category as PostCategory)
          : 'tin-tuc',
        content: post.content,
        imageUrl: post.imageUrl ?? undefined
      }
    : undefined;

  const handleSubmit = async (values: PostPayload) => {
    setSubmitting(true);
    try {
      if (isEditMode && post) {
        await PostAPI.update(post.id, values);
        showToast('Bài viết đã được cập nhật', 'success');
      } else {
        await PostAPI.create(values);
        showToast('Bài viết đã được đăng', 'success');
      }
      navigate('/dashboard/posts');
    } catch (error) {
      console.error('[AdminPostEditorPage] Error:', error);
      showToast('Không thể lưu bài viết', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/posts');
  };

  if (loading) {
    return (
      <div className="container">
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="post-editor">
        <PostEditorForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
};

export default AdminPostEditorPage;
