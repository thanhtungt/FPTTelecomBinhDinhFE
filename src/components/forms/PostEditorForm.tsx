import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PostPayload } from '../../types/post';
import { POST_CATEGORY_OPTIONS, POST_CATEGORY_VALUES } from '../../constants/posts';

const categoryValues = POST_CATEGORY_VALUES;

const formSchema = z.object({
  title: z.string().min(6, 'Title must be at least 6 characters'),
  category: z.enum(categoryValues),
  imageUrl: z
    .string()
    .trim()
    .refine((val) => !val || /^https?:\/\//.test(val), {
      message: 'Image URL must start with http(s)'
    }),
  content: z.string().min(50, 'Content must be at least 50 characters')
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  title: '',
  category: 'tin-tuc',
  imageUrl: '',
  content: ''
};

interface PostEditorFormProps {
  initialValues?: PostPayload;
  submitting?: boolean;
  isEditing?: boolean;
  onSubmit: (values: PostPayload) => void | Promise<void>;
  onCancelEdit?: () => void;
}

const PostEditorForm = ({ initialValues, submitting = false, isEditing = false, onSubmit, onCancelEdit }: PostEditorFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        title: initialValues.title,
        category: initialValues.category,
        content: initialValues.content,
        imageUrl: initialValues.imageUrl ?? ''
      });
    } else {
      reset(defaultValues);
    }
  }, [initialValues, reset]);

  const handleFormSubmit: SubmitHandler<FormValues> = (values) => {
    const normalizedImage = values.imageUrl.trim();
    const payload: PostPayload = {
      title: values.title.trim(),
      category: values.category,
      content: values.content.trim(),
      imageUrl: normalizedImage ? normalizedImage : undefined
    };

    return onSubmit(payload);
  };

  return (
    <form className="post-editor" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="post-editor__header">
        <div>
          <p className="eyebrow">{isEditing ? 'Update story' : 'Share story'}</p>
          <h2>{isEditing ? 'Edit article' : 'New article'}</h2>
        </div>
        {isEditing && (
          <button type="button" className="ghost-btn" onClick={onCancelEdit}>
            Cancel edit
          </button>
        )}
      </div>
      <label>
        <span>Title</span>
        <input type="text" placeholder="Fiber installs 2024 recap" {...register('title')} />
        {errors.title && <small>{errors.title.message}</small>}
      </label>
      <div className="form-grid">
        <label>
          <span>Category</span>
          <select {...register('category')}>
            {POST_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.category && <small>{errors.category.message}</small>}
        </label>
        <label>
          <span>Hero image URL</span>
          <input type="url" placeholder="https://cdn.fpttelecom.vn/story.png" {...register('imageUrl')} />
          {errors.imageUrl && <small>{errors.imageUrl.message}</small>}
        </label>
      </div>
      <label className="post-editor__content">
        <span>Content</span>
        <textarea rows={12} placeholder="Compose the whole story..." {...register('content')} />
        <p className="form-hint">Use line breaks to create paragraphs. Markdown is not supported yet.</p>
        {errors.content && <small>{errors.content.message}</small>}
      </label>
      <button type="submit" className="primary-btn" disabled={submitting}>
        {submitting ? 'Saving...' : isEditing ? 'Update post' : 'Publish post'}
      </button>
    </form>
  );
};

export default PostEditorForm;
