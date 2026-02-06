import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PostPayload } from '../../types/post';
import { POST_CATEGORY_OPTIONS, POST_CATEGORY_VALUES } from '../../constants/posts';
import RichTextEditor from './RichTextEditor';

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
  content: z
    .string()
    .min(1, 'Content is required')
    .refine(
      (html) => {
        // Strip HTML tags and check plain text length
        const text = html.replace(/<[^>]*>/g, '').trim();
        return text.length >= 50;
      },
      { message: 'Content must be at least 50 characters' }
    )
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
  onSubmit: (values: PostPayload) => void | Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  isEditMode?: boolean;
}

const PostEditorForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
  isEditMode = false
}: PostEditorFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
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
    console.log('[PostEditorForm] Form submitted with values:', values);
    const normalizedImage = values.imageUrl.trim();
    const payload: PostPayload = {
      title: values.title.trim(),
      category: values.category,
      content: values.content.trim(),
      imageUrl: normalizedImage ? normalizedImage : undefined
    };
    console.log('[PostEditorForm] Payload to send:', payload);

    return onSubmit(payload);
  };

  return (
    <form className="post-editor" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="post-editor__header">
        <div>
          <p className="eyebrow">{isEditMode ? 'Update story' : 'Share story'}</p>
          <h2>{isEditMode ? 'Edit article' : 'New article'}</h2>
        </div>
        {isEditMode && onCancel && (
          <button type="button" className="ghost-btn" onClick={onCancel}>
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
      <div className="post-editor__content">
        <span>Content</span>
        <Controller
          name="content"
          control={control}
          render={({ field }) => {
            console.log('[Controller] Current field value length:', field.value?.length || 0);
            return (
              <RichTextEditor
                value={field.value}
                onChange={(content) => {
                  console.log('[Controller] onChange called with content length:', content.length, 'preview:', content.substring(0, 50));
                  field.onChange(content);
                }}
                placeholder="Write your story here... Use formatting tools to style your content."
                error={errors.content?.message}
              />
            );
          }}
        />
      </div>
      <button type="submit" className="primary-btn" disabled={submitting}>
        {submitting ? 'Saving...' : isEditMode ? 'Update post' : 'Publish post'}
      </button>
    </form>
  );
};

export default PostEditorForm;
