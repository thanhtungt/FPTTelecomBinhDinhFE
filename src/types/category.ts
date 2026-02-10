export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  packageCount?: number;
}

export interface CreateCategoryDto {
  name: string;
  displayOrder: number;
  active: boolean;
}

export interface UpdateCategoryDto {
  name: string;
  displayOrder: number;
  active: boolean;
}
