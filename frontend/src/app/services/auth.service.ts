import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importer HttpClient
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// import { User } from '../models/user.model'; // Assurez-vous que ce modèle existe et est correct

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/auth'; // Adaptez à l'URL de votre backend
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private currentUser = new BehaviorSubject<any>(null);

  isLoggedIn = this.loggedIn.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) { // Injecter HttpClient
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser.next(JSON.parse(user));
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  login(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.loggedIn.next(true);
    this.currentUser.next(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedIn.next(false);
    this.currentUser.next(null);
  }

  updateUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.next(user);
  }
}