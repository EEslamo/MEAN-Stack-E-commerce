export interface Testimonial {
  _id: string;
  user: string | User;
  content: string;
  review: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  isApproved: boolean;
  isSeen: boolean;
  approvedBy?: string | User;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialRequest {
  content: string;
  rating: number;
}

export interface UpdateTestimonialStatusRequest {
  isApproved: boolean;
  rejectionReason?: string;
}

export interface TestimonialFilters {
  isApproved?: boolean;
  isSeen?: boolean;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'isApproved';
  sortOrder?: 'asc' | 'desc';
}

export interface TestimonialResponse {
  success: boolean;
  data: {
    testimonials: Testimonial[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface TestimonialStats {
  success: boolean;
  data: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    averageRating: number;
    ratingDistribution: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
    };
  };
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
