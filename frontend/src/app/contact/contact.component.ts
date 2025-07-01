import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    sujet: '',
    message: ''
  };

  messageStatus = {
    text: '',
    type: ''
  };

  async handleSubmit(event: Event) {
    event.preventDefault();

    try {
      await emailjs.send(
        'service_evmh05b',
        'template_8bsa3hu',
        {
          name: this.formData.name,
          email: this.formData.email,
          sujet: this.formData.sujet,
          message: this.formData.message,
        },
        'Zl8XCFsIOYRw5ZUlo'
      );

      this.messageStatus = { text: 'Email envoyé !', type: 'success' };
      this.formData = { name: '', email: '', sujet: '', message: '' };
    } catch (error) {
      console.error('Erreur:', error);
      this.messageStatus = { text: "Une erreur s'est produite lors de l'envoi.", type: 'error' };
    }

    setTimeout(() => {
      this.messageStatus = { text: '', type: '' };
    }, 5000);
  }
}
