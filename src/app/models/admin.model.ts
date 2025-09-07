export interface DashboardStats {
  success: boolean;
  data: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    lowStockProducts: number;
    recentOrders: Order[];
    topProducts: Product[];
    monthlyRevenue: MonthlyRevenue[];
  };
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface SalesReport {
  success: boolean;
  data: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByMonth: MonthlyRevenue[];
    salesByCategory: CategorySales[];
    topProducts: ProductSales[];
  };
}

export interface CategorySales {
  category: string;
  sales: number;
  orders: number;
  percentage: number;
}

export interface ProductSales {
  product: Product;
  sales: number;
  orders: number;
  revenue: number;
}

export interface ProductSalesReport {
  success: boolean;
  data: {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    topSellingProducts: ProductSales[];
    categoryBreakdown: CategorySales[];
  };
}

export interface UserStats {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
    usersByRole: {
      admin: number;
      user: number;
    };
    recentRegistrations: User[];
  };
}

export interface InventoryReport {
  success: boolean;
  data: {
    totalProducts: number;
    totalStockValue: number;
    lowStockProducts: Product[];
    outOfStockProducts: Product[];
    categoryInventory: CategoryInventory[];
  };
}

export interface CategoryInventory {
  category: string;
  totalProducts: number;
  totalStock: number;
  totalValue: number;
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
