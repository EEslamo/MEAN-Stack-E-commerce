import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models';

export { Category };

export interface CategoryResponse {
  success: boolean;
  data: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/categories`);
  }

  getMainCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/categories/main`);
  }

  getSubcategories(parentId: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/categories/subcategories/${parentId}`);
  }

  getCategoryById(id: string): Observable<{ success: boolean; data: Category }> {
    return this.http.get<{ success: boolean; data: Category }>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(categoryData: Partial<Category>): Observable<{ success: boolean; data: Category }> {
    return this.http.post<{ success: boolean; data: Category }>(`${this.apiUrl}/categories`, categoryData);
  }

  updateCategory(id: string, categoryData: Partial<Category>): Observable<{ success: boolean; data: Category }> {
    return this.http.put<{ success: boolean; data: Category }>(`${this.apiUrl}/categories/${id}`, categoryData);
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/categories/${id}`);
  }
}