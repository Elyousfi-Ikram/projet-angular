import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/user'; // Backend API URL

  constructor(private http: HttpClient) { }

  updateUser(userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update`, userData);
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwordData);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete`);
  }
}