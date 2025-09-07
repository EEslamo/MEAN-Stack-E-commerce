import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { TestimonialService } from '../../services/testimonial.service';
import { AuthService } from '../../services/auth.service';
import { Product, Order, Testimonial } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  pendingOrders: Order[] = [];
  pendingTestimonials: Testimonial[] = [];
  isLoading = false;
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private testimonialService: TestimonialService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadFeaturedProducts();
    
    if (this.isAdmin) {
      this.loadAdminData();
    }
  }

  loadFeaturedProducts(): void {
    this.isLoading = true;
    this.productService.getFeaturedProducts(8).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.featuredProducts = response.data;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading featured products:', error);
      }
    });
  }

  loadAdminData(): void {
    // Load pending orders
    this.orderService.getOrders({ status: 'pending', limit: 5 }).subscribe({
      next: (response) => {
        this.pendingOrders = response.data;
      },
      error: (error) => {
        console.error('Error loading pending orders:', error);
      }
    });

    // Load pending testimonials
    this.testimonialService.getPendingTestimonials({ limit: 5 }).subscribe({
      next: (response) => {
        this.pendingTestimonials = response.data;
      },
      error: (error) => {
        console.error('Error loading pending testimonials:', error);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}