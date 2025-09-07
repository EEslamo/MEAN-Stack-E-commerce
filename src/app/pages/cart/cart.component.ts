import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem, Product } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  isLoading = false;
  priceChangedItems: CartItem[] = [];
  showPriceChangeModal = false;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (cart) {
        this.checkPriceChanges();
      }
    });
  }

  checkPriceChanges(): void {
    if (!this.cart || !this.cart.items) return;

    this.priceChangedItems = [];
    this.cart.items.forEach(item => {
      if (typeof item.product === 'string') {
        this.productService.getProduct(item.product).subscribe({
          next: (product) => {
            if (product.price !== item.priceAtTime) {
              this.priceChangedItems.push(item);
            }
          }
        });
      } else {
        if (item.product.price !== item.priceAtTime) {
          this.priceChangedItems.push(item);
        }
      }
    });

    if (this.priceChangedItems.length > 0) {
      this.showPriceChangeModal = true;
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    this.cartService.updateQuantity(productId, quantity).subscribe({
      next: () => {
        // Cart will be updated automatically
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        // Cart will be updated automatically
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        // Cart will be updated automatically
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    // Redirect to checkout
    window.location.href = '/checkout';
  }

  handlePriceChange(item: CartItem, action: 'keep' | 'remove'): void {
    if (action === 'keep') {
      // Update the price in cart
      this.cartService.updateQuantity(
        typeof item.product === 'string' ? item.product : item.product._id, 
        item.quantity
      ).subscribe();
    } else {
      // Remove the item
      this.removeFromCart(typeof item.product === 'string' ? item.product : item.product._id);
    }

    // Remove from price changed items
    this.priceChangedItems = this.priceChangedItems.filter(i => i !== item);
    
    if (this.priceChangedItems.length === 0) {
      this.showPriceChangeModal = false;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getProductName(item: CartItem): string {
    if (typeof item.product === 'string') {
      return 'Product';
    }
    return item.product.name;
  }

  getProductPhoto(item: CartItem): string {
    if (typeof item.product === 'string') {
      return '';
    }
    return item.product.photos[0] || '';
  }

  getCurrentPrice(item: CartItem): number {
    if (typeof item.product === 'string') {
      return item.priceAtTime;
    }
    return item.product.price;
  }
}