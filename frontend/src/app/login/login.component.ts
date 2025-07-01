import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service'; // Importez AuthService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { } // Injectez AuthService

  handleSubmit(): void {
    const credentials = { email: this.email, password: this.password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>('http://localhost:3001/api/auth/login', credentials, { headers })
      .subscribe({
        next: (data) => {
          const userInfo = {
            name: data.name,
            prenom: data.prenom,
            email: data.email,
            phone: data.phone
          };
          this.authService.login(data.token, userInfo); // Utilisez AuthService pour vous connecter
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Erreur de connexion :', error);
          this.errorMessage = error.error?.message || "Une erreur s'est produite. Veuillez réessayer.";
        }
      });
  }
}