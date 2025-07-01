import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { AddressService } from '../../services/address.service';
import { NotificationService } from '../../services/notification.service';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormComponent implements OnInit {
  addresses$: Observable<Address[]>;
  showModal = false;
  isEditMode = false;
  isSubmitting = false;

  addressData: Address = this.getInitialAddressData();

  constructor(
    public addressService: AddressService, // Rendu public pour accès direct dans le template
    private notificationService: NotificationService
  ) {
    this.addresses$ = this.addressService.addresses$;
  }

  ngOnInit(): void {
    this.addressService.getAll().subscribe();
  }

  private getInitialAddressData(): Address {
    return { fullName: '', street: '', postalCode: '', city: '', country: '' };
  }

  openModal(address?: Address): void {
    this.isEditMode = !!address;
    this.addressData = address ? { ...address } : this.getInitialAddressData();
    this.showModal = true;
  }

  handleDeleteAddress(addressId: string | undefined): void {
    if (!addressId) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      this.addressService.delete(addressId).subscribe();
    }
  }

  handleSaveAddress(form: NgForm): void {
    if (form.invalid) {
      this.notificationService.showNotification({ message: 'Veuillez remplir tous les champs obligatoires.', type: 'error' });
      return;
    }

    this.isSubmitting = true;
    const operation$ = this.isEditMode
      ? this.addressService.update(this.addressData)
      : this.addressService.add(this.addressData);

    operation$.subscribe({
      next: () => this.closeModal(),
      error: () => this.isSubmitting = false, // Gérer l'erreur pour réactiver le bouton
      complete: () => this.isSubmitting = false
    });
  }

  closeModal(): void {
    this.showModal = false;
  }
}