import type { PostCategory } from '../types/post';

export const POST_CATEGORY_VALUES = ['khuyen-mai', 'tin-tuc', 'huong-dan'] as const;

const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  'khuyen-mai': 'Promotions',
  'tin-tuc': 'News',
  'huong-dan': 'Guides'
};

export const POST_CATEGORY_OPTIONS: Array<{ label: string; value: PostCategory }> = POST_CATEGORY_VALUES.map((value) => ({
  value: value as PostCategory,
  label: POST_CATEGORY_LABELS[value as PostCategory]
}));

export const POST_CATEGORY_LABEL = POST_CATEGORY_LABELS;
