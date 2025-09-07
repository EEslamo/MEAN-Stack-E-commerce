import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api';
  private sessionId = this.generateSessionId();
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  loadCart(): void {
    let params = new HttpParams().set('sessionId', this.sessionId);
    
    this.http.get<CartResponse>(`${this.apiUrl}/cart`, { params }).subscribe(
      response => {
        const cart: Cart = {
          _id: '',
          items: response.data.items,
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalItems: response.data.totalItems,
          totalPrice: response.data.total
        };
        this.cartSubject.next(cart);
      },
      error => console.error('Error loading cart:', error)
    );
  }

  addToCart(productId: string, quantity: number): Observable<CartResponse> {
    const request: AddToCartRequest = { productId, quantity };
    let params = new HttpParams().set('sessionId', this.sessionId);
    
    return this.http.post<CartResponse>(`${this.apiUrl}/cart/add`, request, { params }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateQuantity(productId: string, quantity: number): Observable<CartResponse> {
    const request: UpdateCartItemRequest = { quantity };
    let params = new HttpParams().set('sessionId', this.sessionId);
    
    return this.http.put<CartResponse>(`${this.apiUrl}/cart/${productId}`, request, { params }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeFromCart(productId: string): Observable<CartResponse> {
    let params = new HttpParams().set('sessionId', this.sessionId);
    
    return this.http.delete<CartResponse>(`${this.apiUrl}/cart/${productId}`, { params }).pipe(
      tap(() => this.loadCart())
    );
  }

  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => (cart?.totalItems ?? 0))
    );
  }

  getCart(): Cart | null {
    return this.cartSubject.value;
  }

  clearCart(): Observable<CartResponse> {
    let params = new HttpParams().set('sessionId', this.sessionId);
    
    return this.http.delete<CartResponse>(`${this.apiUrl}/cart`, { params }).pipe(
      tap(() => this.loadCart())
    );
  }

  mergeCart(): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/cart/merge`, {
      sessionId: this.sessionId
    }).pipe(
      tap(() => this.loadCart())
    );
  }
}