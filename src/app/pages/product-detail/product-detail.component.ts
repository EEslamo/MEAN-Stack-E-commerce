import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  isLoading = false;
  error = '';
  selectedQuantity = 1;
  selectedImageIndex = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(productId: string): void {
    this.isLoading = true;
    this.error = '';

    this.productService.getProduct(productId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.product = response.data;
        this.loadRelatedProducts(productId);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Product not found';
      }
    });
  }

  loadRelatedProducts(productId: string): void {
    this.productService.getRelatedProducts(productId, 4).subscribe({
      next: (response) => {
        this.relatedProducts = response.data;
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  addToCart(): void {
    if (this.product && this.selectedQuantity > 0) {
      this.cartService.addToCart(this.product._id, this.selectedQuantity).subscribe({
        next: () => {
          // Show success message
          alert('Product added to cart successfully!');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          alert('Error adding product to cart');
        }
      });
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStockStatus(): string {
    if (!this.product) return '';
    
    if (this.product.stock === 0) return 'Out of Stock';
    if (this.product.stock <= 3) return `Only ${this.product.stock} left`;
    return 'In Stock';
  }

  getStockStatusClass(): string {
    if (!this.product) return '';
    
    if (this.product.stock === 0) return 'text-red-600 bg-red-100';
    if (this.product.stock <= 3) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  }

  canAddToCart(): boolean {
    return this.product ? this.product.stock > 0 && this.selectedQuantity > 0 : false;
  }

  getMaxQuantity(): number {
    return this.product ? Math.min(this.product.stock, 10) : 0;
  }
}