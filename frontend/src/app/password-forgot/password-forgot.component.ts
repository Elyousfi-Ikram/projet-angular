import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-password-forgot',
  templateUrl: './password-forgot.component.html',
  styleUrls: ['./password-forgot.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class PasswordForgotComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  messageStatus: { text: string; type: string } = { text: '', type: '' };

  constructor(private router: Router) { }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  async onSubmit() {
    this.errorMessage = '';
    this.messageStatus = { text: '', type: '' };
    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email })
      });

      if (response.status === 404) {
        this.errorMessage = "Le service de réinitialisation de mot de passe n'est pas disponible pour le moment.";
        return;
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          this.errorMessage = result.message || "Une erreur est survenue. Veuillez réessayer.";
        } else {
          this.errorMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";
        }
        return;
      }

      const data = await response.json();
      const resetToken = data.resetToken;

      try {
        await emailjs.send(
          'service_evmh05b',
          'template_hjimy7o',
          {
            email: this.email,
            resetLink: `${window.location.origin}/password-reset/${resetToken}`
          },
          'Zl8XCFsIOYRw5ZUlo'
        );
        this.messageStatus = { text: 'Email envoyé !', type: 'success' };
      } catch (emailError) {
        console.error('Erreur d\'envoi d\'email:', emailError);
        this.messageStatus = { text: "Une erreur s'est produite lors de l'envoi de l'email.", type: 'error' };
      }

      this.email = '';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);

    } catch (error) {
      console.error('Erreur:', error);
      this.errorMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";
    }
  }
}