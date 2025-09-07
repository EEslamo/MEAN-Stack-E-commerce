import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  error = '';
  message = '';
  showForm = false;
  editingCategory: Category | null = null;

  categoryForm: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      parentCategory: [''],
      image: [''],
      sortOrder: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = '';

    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.categories = response.data;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to load categories';
      }
    });
  }

  createCategory(): void {
    this.editingCategory = null;
    this.categoryForm.reset({ sortOrder: 0 });
    this.showForm = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      parentCategory: typeof category.parentCategory === 'string' ? category.parentCategory : category.parentCategory?._id || '',
      image: category.image || '',
      sortOrder: category.sortOrder
    });
    this.showForm = true;
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      this.error = '';
      this.message = '';

      const categoryData = this.categoryForm.value;
      if (categoryData.parentCategory === '') {
        categoryData.parentCategory = undefined;
      }

      const operation = this.editingCategory
        ? this.categoryService.updateCategory(this.editingCategory._id, categoryData)
        : this.categoryService.createCategory(categoryData);

      operation.subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.message = this.editingCategory ? 'Category updated successfully' : 'Category created successfully';
          this.showForm = false;
          this.editingCategory = null;
          this.loadCategories();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.error = error.error?.message || 'Failed to save category';
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      this.categoryService.deleteCategory(category._id).subscribe({
        next: (response) => {
          this.message = 'Category deleted successfully';
          this.loadCategories();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to delete category';
        }
      });
    }
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.categoryForm.reset({ sortOrder: 0 });
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['min']) return `${fieldName} must be 0 or greater`;
    }
    return '';
  }

  getMainCategories(): Category[] {
    return this.categories.filter(cat => !cat.parentCategory);
  }

  getSubcategories(parentId: string): Category[] {
    return this.categories.filter(cat => 
      typeof cat.parentCategory === 'string' ? cat.parentCategory === parentId : cat.parentCategory?._id === parentId
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
