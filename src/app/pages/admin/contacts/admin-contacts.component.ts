import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { Contact, ContactFilters, UpdateContactStatusRequest } from '../../../models';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-contacts.component.html',
  styleUrls: ['./admin-contacts.component.css']
})
export class AdminContactsComponent implements OnInit {
  contacts: Contact[] = [];
  isLoading = false;
  error = '';
  message = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  selectedContact: Contact | null = null;
  showResponseForm = false;
  responseForm: FormGroup;

  filters: ContactFilters = {
    page: 1,
    limit: 10
  };

  statusFilters = [
    { value: '', label: 'All' },
    { value: 'false', label: 'Pending' },
    { value: 'true', label: 'Resolved' }
  ];

  priorityFilters = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  categoryFilters = [
    { value: '', label: 'All Categories' },
    { value: 'complaint', label: 'Complaints' },
    { value: 'question', label: 'Questions' }
  ];

  constructor(
    private contactService: ContactService,
    private fb: FormBuilder
  ) {
    this.responseForm = this.fb.group({
      response: ['', [Validators.required]],
      priority: ['medium', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.isLoading = true;
    this.error = '';

    this.contactService.getContacts(this.filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.contacts = response.data;
        this.totalPages = response.pagination.totalPages;
        this.totalItems = response.pagination.totalItems;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to load contacts';
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadContacts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.filters.page = page;
    this.loadContacts();
  }

  viewContact(contact: Contact): void {
    this.selectedContact = contact;
    this.showResponseForm = false;
    this.responseForm.reset({ priority: contact.priority });
  }

  respondToContact(): void {
    if (this.selectedContact && this.responseForm.valid) {
      const statusData: UpdateContactStatusRequest = {
        isResolved: true,
        response: this.responseForm.value.response,
        priority: this.responseForm.value.priority
      };

      this.contactService.updateContactStatus(this.selectedContact._id, statusData).subscribe({
        next: (response) => {
          this.message = 'Response sent successfully';
          this.showResponseForm = false;
          this.selectedContact = null;
          this.loadContacts();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to send response';
        }
      });
    }
  }

  deleteContact(contact: Contact): void {
    if (confirm(`Are you sure you want to delete this contact from ${contact.name}?`)) {
      this.contactService.deleteContact(contact._id).subscribe({
        next: (response) => {
          this.message = 'Contact deleted successfully';
          this.loadContacts();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to delete contact';
        }
      });
    }
  }

  closeModal(): void {
    this.selectedContact = null;
    this.showResponseForm = false;
    this.responseForm.reset();
  }

  getPriorityBadgeClass(priority: string): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (priority) {
      case 'high':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'medium':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClass} bg-green-100 text-green-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getCategoryBadgeClass(category: string): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (category) {
      case 'complaint':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'question':
        return `${baseClass} bg-blue-100 text-blue-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatusBadgeClass(isResolved: boolean): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    return isResolved 
      ? `${baseClass} bg-green-100 text-green-800`
      : `${baseClass} bg-yellow-100 text-yellow-800`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
