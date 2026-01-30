export type PostCategory = 'khuyen-mai' | 'tin-tuc' | 'huong-dan';

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  category: PostCategory | string;
  publishedAt: string;
}

export interface PostPayload {
  title: string;
  content: string;
  category: PostCategory;
  imageUrl?: string | null;
}
