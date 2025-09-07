import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductFilters, Category } from '../../models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  mainCategories: Category[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  
  filters: ProductFilters = {
    page: 1,
    limit: 12,
    search: '',
    category: '',
    sortBy: 'name',
    sortOrder: 'asc'
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filters.category = params['category'];
      }
      if (params['search']) {
        this.filters.search = params['search'];
      }
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      response => {
        this.categories = response.data;
        this.mainCategories = response.data.filter(cat => !cat.parentCategory);
      }
    );
  }

  getSubcategories(parentId: string): Category[] {
    return this.categories.filter(cat => (typeof cat.parentCategory === 'object' ? cat.parentCategory?._id : cat.parentCategory) === parentId);
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.filters).subscribe(
      response => {
        this.products = response.data.products;
        this.currentPage = response.data.pagination.currentPage;
        this.totalPages = response.data.pagination.totalPages;
        this.loading = false;
      },
      error => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    );
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadProducts();
    
    // Update URL params
    const queryParams: any = {};
    if (this.filters.search) queryParams.search = this.filters.search;
    if (this.filters.category) queryParams.category = this.filters.category;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.filters.page = page;
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  addToCart(product: Product): void {
    if (product.stock > 0) {
      this.cartService.addToCart(product._id, 1).subscribe(
        () => {
          // Show success message or notification
        },
        error => console.error('Error adding to cart:', error)
      );
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}