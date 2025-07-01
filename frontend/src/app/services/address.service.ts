import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Address } from '../models/address.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = '/api/address';
  private addressesSource = new BehaviorSubject<Address[]>([]);
  addresses$: Observable<Address[]> = this.addressesSource.asObservable();

  constructor(private http: HttpClient, private notificationService: NotificationService) {}

  private handleError(error: HttpErrorResponse, defaultMessage: string) {
    const message = error.error?.message || defaultMessage;
    this.notificationService.showNotification({ message, type: 'error' });
    console.error('API Error:', error);
    return throwError(() => new Error(message));
  }

  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/getAll`).pipe(
      tap(addresses => this.addressesSource.next(addresses)),
      catchError(err => this.handleError(err, 'Erreur de récupération des adresses'))
    );
  }

  add(address: Address): Observable<{ message: string, address: Address }> {
    return this.http.post<{ message: string, address: Address }>(`${this.apiUrl}/add`, address).pipe(
      tap(response => {
        const currentAddresses = this.addressesSource.getValue();
        this.addressesSource.next([...currentAddresses, response.address]);
        this.notificationService.showNotification({ message: 'Adresse ajoutée avec succès', type: 'success' });
      }),
      catchError(err => this.handleError(err, 'Erreur lors de l\'ajout de l\'adresse'))
    );
  }

  update(address: Address): Observable<any> {
    // L'API attend `addressId`, pas `_id` dans le corps de la requête
    const { _id, ...addressData } = address;
    return this.http.put(`${this.apiUrl}/update`, { ...addressData, addressId: _id }).pipe(
      tap(() => {
        const updatedAddresses = this.addressesSource.getValue().map(a => 
          a._id === address._id ? address : a
        );
        this.addressesSource.next(updatedAddresses);
        this.notificationService.showNotification({ message: 'Adresse modifiée avec succès', type: 'success' });
      }),
      catchError(err => this.handleError(err, 'Erreur lors de la modification de l\'adresse'))
    );
  }

  delete(addressId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${addressId}`).pipe(
      tap(() => {
        const filteredAddresses = this.addressesSource.getValue().filter(a => a._id !== addressId);
        this.addressesSource.next(filteredAddresses);
        this.notificationService.showNotification({ message: 'Adresse supprimée avec succès', type: 'success' });
      }),
      catchError(err => this.handleError(err, 'Erreur lors de la suppression de l\'adresse'))
    );
  }
}