import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  name: string = '';
  prenom: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  phone: string = '';

  // Inject Router service
  constructor(private router: Router) { }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.password.length < 6) {
      this.setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const credentials = {
      name: this.name.trim(),
      prenom: this.prenom.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      password: this.password
    };

    try {
      const signupResponse = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(credentials),
      });

      if (!signupResponse.ok) {
        const errorText = await signupResponse.text();
        throw new Error(`Signup failed: ${errorText}`);
      }

      const signupData = await signupResponse.json();

      this.router.navigate(['/']);

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : "Une erreur s'est produite. Veuillez réessayer.";
      this.setErrorMessage(errorMessage);
    }
  }

  setErrorMessage(message: string): void {
    this.errorMessage = message;
    // Optional: Clear error message after a few seconds
    setTimeout(() => { this.errorMessage = ''; }, 5000);
  }
}
