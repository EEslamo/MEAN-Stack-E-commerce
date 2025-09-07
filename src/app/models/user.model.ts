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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  address: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
