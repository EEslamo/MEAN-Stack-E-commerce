export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  category: 'complaint' | 'question';
  subject?: string;
  message: string;
  isResolved: boolean;
  resolvedBy?: string | User;
  resolvedAt?: string;
  response?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  category: 'complaint' | 'question';
  subject?: string;
  message: string;
}

export interface UpdateContactStatusRequest {
  isResolved: boolean;
  response?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ContactFilters {
  category?: 'complaint' | 'question';
  isResolved?: boolean;
  priority?: 'low' | 'medium' | 'high';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'isResolved';
  sortOrder?: 'asc' | 'desc';
}

export interface ContactResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface ContactStats {
  success: boolean;
  data: {
    total: number;
    resolved: number;
    pending: number;
    complaints: number;
    questions: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
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
