import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, SalesReport, ProductSalesReport, UserStats, InventoryReport } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin/dashboard`);
  }

  getSalesReport(): Observable<SalesReport> {
    return this.http.get<SalesReport>(`${this.apiUrl}/admin/reports/sales`);
  }

  getProductSalesReport(): Observable<ProductSalesReport> {
    return this.http.get<ProductSalesReport>(`${this.apiUrl}/admin/reports/products`);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/admin/reports/users`);
  }

  getInventoryReport(): Observable<InventoryReport> {
    return this.http.get<InventoryReport>(`${this.apiUrl}/admin/reports/inventory`);
  }
}