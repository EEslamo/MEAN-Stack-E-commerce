export interface CartItem {
  product: string | Product;
  quantity: number;
  addedAt: string;
  priceAtTime: number;
}

export interface Cart {
  _id: string;
  user?: string | User;
  sessionId?: string;
  items: CartItem[];
  updatedAt: string;
  expiresAt: string;
  totalItems?: number;
  totalPrice?: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    priceChangedItems?: CartItem[];
    total: number;
    totalItems: number;
  };
  message?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Category {
  _id: string;
  name: string;
  parentCategory?: string | Category;
  description?: string;
  image?: string;
  isActive: boolean;
  isDeleted: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
