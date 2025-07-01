import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

export interface PaymentMethod {
  _id: string;
  userId: string;
  cardType: string;
  cardholderName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  paypalEmail?: string;
  paypalName?: string;
  applePayDeviceId?: string;
  applePayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payment`;

  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  paymentMethods$ = this.paymentMethodsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  private handleError(error: HttpErrorResponse) {
    const errorMessage = error.error?.message || 'Une erreur est survenue.';
    this.notificationService.showNotification({ message: errorMessage, type: 'error' });
    return throwError(() => new Error(errorMessage));
  }

  fetchPayments(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/getAll`).pipe(
      tap(payments => {
        console.log('Moyens de paiement récupérés:', payments);
        this.paymentMethodsSubject.next(payments);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  addPayment(payment: Omit<PaymentMethod, '_id' | 'userId'>): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.apiUrl}/add`, payment).pipe(
      tap(newPayment => {
        console.log('Nouveau moyen de paiement ajouté:', newPayment);
        const currentPayments = this.paymentMethodsSubject.value;
        this.paymentMethodsSubject.next([...currentPayments, newPayment]);
        this.notificationService.showNotification({ message: 'Moyen de paiement ajouté avec succès.', type: 'success' });
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deletePayment(paymentId: string): Observable<{}> {
    return this.http.delete(`${this.apiUrl}/delete/${paymentId}`).pipe(
      tap(() => {
        console.log('Moyen de paiement supprimé:', paymentId);
        const payments = this.paymentMethodsSubject.value.filter(p => p._id !== paymentId);
        this.paymentMethodsSubject.next(payments);
        this.notificationService.showNotification({ message: 'Moyen de paiement supprimé avec succès.', type: 'success' });
      }),
      catchError(this.handleError.bind(this))
    );
  }

  refreshPayments(): void {
    this.fetchPayments().subscribe();
  }
}