import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserInfoComponent } from './user-info/user-info.component';
import { AddressFormComponent } from './address-form/address-form.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { FaqComponent } from './faq/faq.component';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service'; // À créer
import { User } from '../models/user.model'; // Assurez-vous que ce modèle existe
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserInfoComponent,
    AddressFormComponent,
    PaymentFormComponent,
  ],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Stratégie OnPush pour de meilleures performances
})
export class ProfilComponent implements OnInit {
  tabs = [
    { key: 'informations', label: 'Informations personnelles' },
    { key: 'adresses', label: 'Adresses' },
    { key: 'paiement', label: 'Paiement' },
  ];

  activeTab: string = 'informations';
  isFaqOpen = false;

  // Utiliser les observables pour les données
  user$: Observable<User | null>;
  temporaryMessage$: Observable<string | null>;

  constructor(
    private router: Router,
    private authService: AuthService,
    public notificationService: NotificationService // Injection du service de notification
  ) {
    this.user$ = this.authService.currentUser$;
    this.temporaryMessage$ = this.notificationService.notification$.pipe(
      map(notification => notification ? notification.message : null)
    );
  }

  ngOnInit(): void {
    // Les données sont maintenant gérées par le service et le pipe async
  }

  handleTabChange(tab: string): void {
    this.activeTab = tab;
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // La méthode handleUserUpdate est supprimée car elle n'est plus nécessaire.

}