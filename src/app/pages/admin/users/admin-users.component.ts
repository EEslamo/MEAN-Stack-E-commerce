import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  error = '';
  message = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  selectedUser: User | null = null;
  showUserForm = false;
  userForm: FormGroup;

  filters = {
    page: 1,
    limit: 10,
    role: '',
    isActive: ''
  };

  roleFilters = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'Users' },
    { value: 'admin', label: 'Admins' }
  ];

  statusFilters = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
      address: ['', [Validators.required, Validators.maxLength(500)]],
      role: ['user', [Validators.required]],
      isActive: [true, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = '';

    // Note: This would need to be implemented in the backend
    // For now, we'll simulate loading users
    this.isLoading = false;
    this.users = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '01234567890',
        address: '123 Main St, Cairo',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '01234567891',
        address: '456 Oak Ave, Alexandria',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.totalPages = 1;
    this.totalItems = this.users.length;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.filters.page = page;
    this.loadUsers();
  }

  createUser(): void {
    this.selectedUser = null;
    this.userForm.reset({
      role: 'user',
      isActive: true
    });
    this.showUserForm = true;
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive
    });
    this.showUserForm = true;
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.message = '';

      const userData = this.userForm.value;

      if (this.selectedUser) {
        // Update user
        this.message = 'User updated successfully';
      } else {
        // Create user
        this.message = 'User created successfully';
      }

      this.isLoading = false;
      this.showUserForm = false;
      this.selectedUser = null;
      this.loadUsers();
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      this.message = 'User deleted successfully';
      this.loadUsers();
    }
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      user.isActive = !user.isActive;
      this.message = `User ${action}d successfully`;
    }
  }

  closeModal(): void {
    this.selectedUser = null;
    this.showUserForm = false;
    this.userForm.reset();
  }

  getRoleBadgeClass(role: string): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (role) {
      case 'admin':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'user':
        return `${baseClass} bg-blue-100 text-blue-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    return isActive 
      ? `${baseClass} bg-green-100 text-green-800`
      : `${baseClass} bg-red-100 text-red-800`;
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['pattern']) return 'Please enter a valid Egyptian phone number';
    }
    return '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTotalPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
