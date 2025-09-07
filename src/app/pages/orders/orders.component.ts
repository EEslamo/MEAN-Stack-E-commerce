import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  error = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  statusFilters: { value: OrderStatus | '', label: string }[] = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready_for_shipping', label: 'Ready for Shipping' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'received', label: 'Received' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  selectedStatus: OrderStatus | '' = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = '';

    const filters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...(this.selectedStatus && { status: this.selectedStatus })
    };

    this.orderService.getOrders(filters).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.orders = response.data;
        this.totalPages = response.pagination.totalPages;
        this.totalItems = response.pagination.totalItems;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to load orders';
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order._id).subscribe({
        next: (response) => {
          this.loadOrders();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to cancel order';
        }
      });
    }
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'preparing':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'ready_for_shipping':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'shipped':
        return `${baseClass} bg-indigo-100 text-indigo-800`;
      case 'received':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'cancelled':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'preparing':
        return 'Preparing';
      case 'ready_for_shipping':
        return 'Ready for Shipping';
      case 'shipped':
        return 'Shipped';
      case 'received':
        return 'Received';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'pending' || order.status === 'preparing';
  }

  getTotalPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
