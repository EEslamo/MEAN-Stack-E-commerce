import { Product } from './product.model';
import { User } from './user.model';
import { Category } from './category.model';

export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
  productSnapshot: {
    name: string;
    description: string;
    photo: string;
  };
}

export interface StatusHistory {
  status: OrderStatus;
  changedBy: string | User;
  changedAt: string;
  note?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready_for_shipping' | 'shipped' | 'received' | 'rejected' | 'cancelled';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  postalCode?: string;
}

export interface ShippingInfo {
  trackingNumber?: string;
  shippingCompany?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  cancellationReason?: string;
  cancellationDate?: string;
  customerInfo: CustomerInfo;
  shippingInfo: ShippingInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  customerInfo: CustomerInfo;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}
