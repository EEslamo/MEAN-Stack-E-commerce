import { Category } from './category.model';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  photos: string[];
  category: string | Category;
  stock: number;
  sku?: string;
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isDeleted: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  discountPercentage?: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}
