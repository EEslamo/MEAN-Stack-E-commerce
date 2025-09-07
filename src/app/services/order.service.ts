import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest, UpdateOrderStatusRequest, OrderFilters, OrderResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<{ success: boolean; data: Order }> {
    return this.http.post<{ success: boolean; data: Order }>(`${this.apiUrl}/orders`, orderData);
  }

  getOrders(filters?: OrderFilters): Observable<OrderResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<OrderResponse>(`${this.apiUrl}/orders`, { params });
  }

  getOrderById(id: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/orders/${id}`);
  }

  cancelOrder(id: string, reason?: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/orders/${id}/cancel`, { reason });
  }

  updateOrderStatus(id: string, statusData: UpdateOrderStatusRequest): Observable<{ success: boolean; data: Order }> {
    return this.http.put<{ success: boolean; data: Order }>(`${this.apiUrl}/orders/${id}/status`, statusData);
  }

  getOrderStats(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/orders/admin/stats`);
  }
}