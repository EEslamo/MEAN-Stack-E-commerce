import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, CreateContactRequest, UpdateContactStatusRequest, ContactFilters, ContactResponse, ContactStats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  createContact(contactData: CreateContactRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/contact`, contactData);
  }

  getContacts(filters?: ContactFilters): Observable<ContactResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ContactResponse>(`${this.apiUrl}/contact`, { params });
  }

  getContactById(id: string): Observable<{ success: boolean; data: Contact }> {
    return this.http.get<{ success: boolean; data: Contact }>(`${this.apiUrl}/contact/${id}`);
  }

  updateContactStatus(id: string, statusData: UpdateContactStatusRequest): Observable<{ success: boolean; data: Contact }> {
    return this.http.put<{ success: boolean; data: Contact }>(`${this.apiUrl}/contact/${id}`, statusData);
  }

  deleteContact(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/contact/${id}`);
  }

  getContactStats(): Observable<ContactStats> {
    return this.http.get<ContactStats>(`${this.apiUrl}/contact/admin/stats`);
  }
}