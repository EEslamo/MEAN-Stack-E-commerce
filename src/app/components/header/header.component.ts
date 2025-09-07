import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: any = null;
  cartItemCount = 0;
  categories: Category[] = [];
  mainCategories: Category[] = [];
  showUserMenu = false;
  showMobileMenu = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart ? cart.items.reduce((count, item) => count + item.quantity, 0) : 0;
    });

    this.loadCategories();
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

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}