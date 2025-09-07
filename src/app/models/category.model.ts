export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentCategory?: Category | string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategory?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentCategory?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  mainCategories: number;
  subcategories: number;
}
