import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PostPayload } from '../../types/post';
import { POST_CATEGORY_OPTIONS, POST_CATEGORY_VALUES } from '../../constants/posts';
import RichTextEditor from './RichTextEditor.lazy';

const categoryValues = POST_CATEGORY_VALUES;

const formSchema = z.object({
  title: z.string().min(6, 'Tiêu đề phải có ít nhất 6 ký tự'),
  category: z.enum(categoryValues),
  imageUrl: z
    .string()
    .trim()
    .refine((val) => !val || /^https?:\/\//.test(val), {
      message: 'URL hình ảnh phải bắt đầu bằng http(s)'
    }),
  content: z
    .string()
    .min(1, 'Nội dung là bắt buộc')
    .refine(
      (html) => {
        // Strip HTML tags and check plain text length
        const text = html.replace(/<[^>]*>/g, '').trim();
        return text.length >= 50;
      },
      { message: 'Nội dung phải có ít nhất 50 ký tự' }
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
          <p className="eyebrow">{isEditMode ? 'Cập nhật bài viết' : 'Chia sẻ bài viết'}</p>
          <h2>{isEditMode ? 'Sửa bài viết' : 'Bài viết mới'}</h2>
        </div>
        {isEditMode && onCancel && (
          <button type="button" className="ghost-btn" onClick={onCancel}>
            Thoát chỉnh sửa
          </button>
        )}
      </div>
      <label>
        <span>Tiêu đề</span>
        <input type="text" placeholder="Tiêu đề" {...register('title')} />
        {errors.title && <small>{errors.title.message}</small>}
      </label>
      <div className="form-grid">
        <label>
          <span>Loại</span>
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
          <span>URL hình ảnh</span>
          <input type="url" placeholder="https://cdn.fpttelecom.vn/story.png" {...register('imageUrl')} />
          {errors.imageUrl && <small>{errors.imageUrl.message}</small>}
        </label>
      </div>
      <div className="post-editor__content">
        <span>Nội dung</span>
        <Controller
          name="content"
          control={control}
          render={({ field }) => {
            return (
              <RichTextEditor
                value={field.value}
                onChange={(content) => {
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
        {submitting ? 'Saving...' : isEditMode ? 'Cập nhật bài viết' : 'Đăng bài viết'}
      </button>
    </form>
  );
};

export default PostEditorForm;
