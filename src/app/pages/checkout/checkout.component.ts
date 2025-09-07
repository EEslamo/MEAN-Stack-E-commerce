import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CreateOrderRequest, CustomerInfo, User } from '../../models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  user: User | null = null;
  checkoutForm: FormGroup;
  isLoading = false;
  error = '';
  message = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
      address: ['', [Validators.required, Validators.maxLength(500)]],
      city: ['', [Validators.maxLength(100)]],
      postalCode: ['', [Validators.maxLength(20)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadUser();
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (!cart || !cart.items || cart.items.length === 0) {
        this.error = 'Your cart is empty';
      }
    });
  }

  loadUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.checkoutForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address
        });
      }
    });
  }

  placeOrder(): void {
    if (this.checkoutForm.valid && this.cart && this.cart.items.length > 0) {
      this.isLoading = true;
      this.error = '';
      this.message = '';

      const customerInfo: CustomerInfo = {
        name: this.checkoutForm.value.name,
        email: this.checkoutForm.value.email,
        phone: this.checkoutForm.value.phone,
        address: this.checkoutForm.value.address,
        city: this.checkoutForm.value.city || undefined,
        postalCode: this.checkoutForm.value.postalCode || undefined
      };

      const orderData: CreateOrderRequest = {
        items: this.cart.items.map(item => ({
          productId: typeof item.product === 'string' ? item.product : item.product._id,
          quantity: item.quantity
        })),
        customerInfo,
        notes: this.checkoutForm.value.notes || undefined
      };

      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = 'Order placed successfully!';
          this.cartService.clearCart().subscribe();
          // Redirect to orders page or show success message
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Failed to place order';
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['pattern']) return 'Please enter a valid Egyptian phone number';
    }
    return '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getSubtotal(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
  }

  getTotalItems(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}
