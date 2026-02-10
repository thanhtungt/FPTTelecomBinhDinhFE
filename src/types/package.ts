export interface Package {
  id: number;
  name: string;
  speedDown: number;
  speedUp: number;
  priceMonthly: number;
  promotionText: string;
  deviceBonus: string;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  active: boolean;
}

export interface CreatePackageDto {
  name: string;
  speedDown: number;
  speedUp: number;
  priceMonthly: number;
  promotionText: string;
  deviceBonus: string;
  imageUrl?: string;
  categoryId: number;
  active: boolean;
}

export interface UpdatePackageDto {
  name: string;
  speedDown: number;
  speedUp: number;
  priceMonthly: number;
  promotionText: string;
  deviceBonus: string;
  imageUrl?: string;
  categoryId: number;
  active: boolean;
}
