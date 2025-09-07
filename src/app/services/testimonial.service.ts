import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Testimonial, CreateTestimonialRequest, UpdateTestimonialStatusRequest, TestimonialFilters, TestimonialResponse, TestimonialStats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTestimonials(filters?: TestimonialFilters): Observable<TestimonialResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TestimonialResponse>(`${this.apiUrl}/testimonials`, { params });
  }

  createTestimonial(testimonialData: CreateTestimonialRequest): Observable<{ success: boolean; data: Testimonial }> {
    return this.http.post<{ success: boolean; data: Testimonial }>(`${this.apiUrl}/testimonials`, testimonialData);
  }

  getUserTestimonial(): Observable<{ success: boolean; data: Testimonial | null }> {
    return this.http.get<{ success: boolean; data: Testimonial | null }>(`${this.apiUrl}/testimonials/my`);
  }

  updateTestimonial(testimonialData: CreateTestimonialRequest): Observable<{ success: boolean; data: Testimonial }> {
    return this.http.put<{ success: boolean; data: Testimonial }>(`${this.apiUrl}/testimonials/my`, testimonialData);
  }

  deleteTestimonial(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/testimonials/my`);
  }

  getPendingTestimonials(filters?: TestimonialFilters): Observable<TestimonialResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TestimonialResponse>(`${this.apiUrl}/testimonials/admin/pending`, { params });
  }

  updateTestimonialStatus(id: string, statusData: UpdateTestimonialStatusRequest): Observable<{ success: boolean; data: Testimonial }> {
    return this.http.put<{ success: boolean; data: Testimonial }>(`${this.apiUrl}/testimonials/admin/${id}`, statusData);
  }

  deleteTestimonialAdmin(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/testimonials/admin/${id}`);
  }

  getTestimonialStats(): Observable<TestimonialStats> {
    return this.http.get<TestimonialStats>(`${this.apiUrl}/testimonials/admin/stats`);
  }
}