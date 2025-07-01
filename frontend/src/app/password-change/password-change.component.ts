import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit {
  private readonly PASSWORD_MISMATCH_MESSAGE = 'Les mots de passe ne correspondent pas';
  private readonly PASSWORD_COMPLEXITY_MESSAGE = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
  private readonly RESET_SUCCESS_MESSAGE = 'Votre mot de passe a été réinitialisé avec succès';
  private readonly RESET_ERROR_MESSAGE = 'Une erreur est survenue lors de la réinitialisation du mot de passe';
  private readonly VERIFY_ERROR_MESSAGE = 'Une erreur est survenue lors de la vérification du lien';

  passwords: { [key: string]: string } = { newPassword: '', confirmPassword: '' };
  errorMessage = '';
  successMessage = '';
  showPassword: { [key: string]: boolean } = { newPassword: false, confirmPassword: false };
  token!: string | null;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(public router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    this.verifyToken();
  }

  private verifyToken(): void {
    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.post('http://localhost:3001/api/auth/verify-token', { token: this.token })
      .subscribe(
        () => {},
        error => this.handleError(this.VERIFY_ERROR_MESSAGE, error)
      );
  }

  handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.arePasswordsMatching()) {
      this.errorMessage = this.PASSWORD_MISMATCH_MESSAGE;
      return;
    }

    if (!this.isPasswordComplex()) {
      this.errorMessage = this.PASSWORD_COMPLEXITY_MESSAGE;
      return;
    }

    this.http.post('http://localhost:3001/api/auth/reset-password', {
      token: this.token,
      newPassword: this.passwords['newPassword']
    }).subscribe(
      response => this.handleSuccess(),
      error => this.handleError(this.RESET_ERROR_MESSAGE, error)
    );
  }

  private arePasswordsMatching(): boolean {
    return this.passwords['newPassword'] === this.passwords['confirmPassword'];
  }

  private isPasswordComplex(): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,@$!%*?&])[A-Za-z\d.,@$!%*?&]{8,}$/;
    return passwordRegex.test(this.passwords['newPassword']);
  }

  private handleSuccess(): void {
    this.successMessage = this.RESET_SUCCESS_MESSAGE;
    this.passwords = { newPassword: '', confirmPassword: '' };
    setTimeout(() => this.router.navigate(['/login']), 3000);
  }

  private handleError(message: string, error: any): void {
    console.error('Erreur:', error);
    this.errorMessage = message;
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.passwords[target.name] = target.value;
  }

  togglePasswordVisibility(field: string): void {
    this.showPassword[field] = !this.showPassword[field];
  }
}