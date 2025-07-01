import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';
import { PaymentMethod } from '../../services/payment.service';
import * as QRCode from 'qrcode';

// Déclaration pour Apple Pay et PayPal
declare global {
  interface Window {
    ApplePay: any;
    paypal: any;
  }
}

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  paymentMethods$: Observable<PaymentMethod[]>;
  selectedPaymentType: string = '';
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();
  qrCodeDataURL: string = '';
  showQRCode: boolean = false;
  applePaySession: any;
  isApplePayAvailable: boolean = false;
  isPayPalLoaded: boolean = false;
  paypalButtonRendered: boolean = false;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.fb.group({
      cardType: ['', Validators.required],
      cardholderName: [''],
      cardNumber: [''],
      expiryMonth: [''],
      expiryYear: [''],
      paypalEmail: [''],
      paypalName: [''],
      applePayDeviceId: [''],
      applePayName: ['']
    });
    this.paymentMethods$ = this.paymentService.paymentMethods$;
  }

  ngOnInit(): void {
    this.paymentService.fetchPayments().pipe(takeUntil(this.destroy$)).subscribe({
      error: (error) => {
        console.error('Erreur lors de la récupération des moyens de paiement:', error);
      }
    });

    // Écouter les changements de type de paiement
    this.paymentForm.get('cardType')?.valueChanges.subscribe(value => {
      this.selectedPaymentType = value;
      this.updateValidators();
    });

    // Vérifier la disponibilité d'Apple Pay
    this.checkApplePayAvailability();
    
    // Charger PayPal SDK
    this.loadPayPalSDK();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateValidators(): void {
    const cardholderName = this.paymentForm.get('cardholderName');
    const cardNumber = this.paymentForm.get('cardNumber');
    const expiryMonth = this.paymentForm.get('expiryMonth');
    const expiryYear = this.paymentForm.get('expiryYear');
    const paypalEmail = this.paymentForm.get('paypalEmail');
    const paypalName = this.paymentForm.get('paypalName');
    const applePayDeviceId = this.paymentForm.get('applePayDeviceId');
    const applePayName = this.paymentForm.get('applePayName');

    // Réinitialiser tous les validateurs
    cardholderName?.clearValidators();
    cardNumber?.clearValidators();
    expiryMonth?.clearValidators();
    expiryYear?.clearValidators();
    paypalEmail?.clearValidators();
    paypalName?.clearValidators();
    applePayDeviceId?.clearValidators();
    applePayName?.clearValidators();

    if (['visa', 'mastercard', 'amex'].includes(this.selectedPaymentType)) {
      cardholderName?.setValidators([Validators.required]);
      cardNumber?.setValidators([Validators.required, this.cardNumberValidator]);
      expiryMonth?.setValidators([Validators.required, Validators.pattern('^(0[1-9]|1[0-2])$')]);
      expiryYear?.setValidators([Validators.required, Validators.pattern('^[0-9]{2}$')]);
    } else if (this.selectedPaymentType === 'paypal') {
      paypalEmail?.setValidators([Validators.required, Validators.email]);
      paypalName?.setValidators([Validators.required]);
    } else if (this.selectedPaymentType === 'applepay') {
      applePayDeviceId?.setValidators([Validators.required]);
      applePayName?.setValidators([Validators.required]);
    }

    // Mettre à jour la validation
    cardholderName?.updateValueAndValidity();
    cardNumber?.updateValueAndValidity();
    expiryMonth?.updateValueAndValidity();
    expiryYear?.updateValueAndValidity();
    paypalEmail?.updateValueAndValidity();
    paypalName?.updateValueAndValidity();
    applePayDeviceId?.updateValueAndValidity();
    applePayName?.updateValueAndValidity();
  }

  cardNumberValidator(control: any) {
    const value = control.value?.replace(/\s/g, '') || '';
    if (value.length !== 16 || !/^[0-9]+$/.test(value)) {
      return { invalidCardNumber: true };
    }
    return null;
  }

  detectCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (cleanNumber.startsWith('4')) {
      return 'visa';
    } else if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) {
      return 'mastercard';
    } else if (cleanNumber.startsWith('3')) {
      return 'amex';
    }
    return 'visa';
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = { ...this.paymentForm.value };

    let paymentData: any = {
      cardType: formValue.cardType
    };

    if (['visa', 'mastercard', 'amex'].includes(formValue.cardType)) {
      const cleanCardNumber = formValue.cardNumber.replace(/\s/g, '');
      const cardType = this.detectCardType(cleanCardNumber);

      paymentData = {
        cardType,
        cardholderName: formValue.cardholderName,
        cardNumber: cleanCardNumber,
        expiryMonth: formValue.expiryMonth,
        expiryYear: formValue.expiryYear
      };
    } else if (formValue.cardType === 'paypal') {
      paymentData.paypalEmail = formValue.paypalEmail;
      paymentData.paypalName = formValue.paypalName;
    } else if (formValue.cardType === 'applepay') {
      paymentData.applePayDeviceId = formValue.applePayDeviceId;
      paymentData.applePayName = formValue.applePayName;
    }

    this.paymentService.addPayment(paymentData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.paymentService.fetchPayments().pipe(takeUntil(this.destroy$)).subscribe();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openModal(): void {
    this.paymentForm.reset();
    this.selectedPaymentType = '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  trackByPaymentId(index: number, payment: PaymentMethod): string {
    return payment._id;
  }

  getCardTypeLabel(cardType: string): string {
    switch (cardType) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      case 'paypal':
        return 'PayPal';
      case 'applepay':
        return 'Apple Pay';
      default:
        return cardType;
    }
  }

  onDelete(paymentId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?')) {
      this.paymentService.deletePayment(paymentId).pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  async generateApplePayQRCode() {
    const applePayName = this.paymentForm.get('applePayName')?.value;
    const deviceId = this.paymentForm.get('applePayDeviceId')?.value;

    if (!applePayName || !deviceId) {
      return;
    }

    try {
      // URL qui ouvre directement l'app Wallet sur iPhone
      const walletURL = `shoebox://`;

      // Alternative: URL qui ouvre les réglages Apple Pay
      // const settingsURL = `prefs:root=PASSBOOK`;

      // Générer le QR code
      this.qrCodeDataURL = await QRCode.toDataURL(walletURL, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      this.showQRCode = true;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      // Fallback: générer un QR code avec une URL web
      this.generateFallbackQRCode();
    }
  }

  private async generateFallbackQRCode() {
    try {
      const fallbackURL = 'https://support.apple.com/apple-pay';
      this.qrCodeDataURL = await QRCode.toDataURL(fallbackURL, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      this.showQRCode = true;
    } catch (error) {
      console.error('Erreur fallback QR code:', error);
    }
  }

  hideQRCode() {
    this.showQRCode = false;
    this.qrCodeDataURL = '';
  }

  checkApplePayAvailability() {
    if (window.ApplePay && window.ApplePay.canMakePayments) {
      this.isApplePayAvailable = window.ApplePay.canMakePayments();
    }
  }

  async importFromApplePay() {
    if (!this.isApplePayAvailable) {
      alert('Apple Pay n\'est pas disponible sur cet appareil');
      return;
    }

    try {
      const paymentRequest = {
        countryCode: 'FR',
        currencyCode: 'EUR',
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Configuration Apple Pay',
          amount: '0.01' // Montant minimal pour la validation
        }
      };

      // Utiliser window.ApplePay.ApplePaySession au lieu de ApplePaySession directement
      this.applePaySession = new window.ApplePay.ApplePaySession(3, paymentRequest);
      
      // Gérer les événements
      this.applePaySession.onvalidatemerchant = this.onValidateMerchant.bind(this);
      this.applePaySession.onpaymentauthorized = this.onPaymentAuthorized.bind(this);
      this.applePaySession.oncancel = this.onCancel.bind(this);
      
      // Démarrer la session
      this.applePaySession.begin();
      
    } catch (error) {
      console.error('Erreur lors de l\'importation Apple Pay:', error);
    }
  }

  onValidateMerchant(event: any) {
    // Valider le marchand avec votre serveur
    // Cette étape nécessite une configuration côté serveur
    console.log('Validation marchand:', event);
  }

  onPaymentAuthorized(event: any) {
    // Récupérer les informations de la carte
    const paymentData = event.payment;

    // Extraire les informations de la carte
    const cardInfo = {
      cardType: this.detectCardType(paymentData.token.paymentMethod.network),
      cardholderName: paymentData.billingContact?.givenName + ' ' + paymentData.billingContact?.familyName,
      cardNumber: '**** **** **** ' + paymentData.token.paymentMethod.displayName.slice(-4),
      // Note: Les vraies données de carte sont cryptées dans le token
    };

    // Pré-remplir le formulaire
    this.prefillFormWithApplePayData(cardInfo);

    // Compléter la transaction
    this.applePaySession.completePayment(window.ApplePay.ApplePaySession.STATUS_SUCCESS);
  }

  onCancel() {
    console.log('Apple Pay annulé');
  }

  prefillFormWithApplePayData(cardInfo: any) {
    this.paymentForm.patchValue({
      cardType: cardInfo.cardType,
      cardholderName: cardInfo.cardholderName,
      cardNumber: cardInfo.cardNumber
    });

    // Fermer le modal QR code
    this.hideQRCode();

    // Afficher un message de succès
    alert('Informations Apple Pay importées avec succès!');
  }

  renderPayPalButton(): void {
    // Vérifications préalables renforcées
    if (!window.paypal) {
      console.warn('SDK PayPal non chargé');
      return;
    }
  
    if (this.paypalButtonRendered) {
      console.log('Bouton PayPal déjà rendu');
      return;
    }
  
    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) {
      console.warn('Conteneur PayPal non trouvé');
      // Réessayer après un délai
      setTimeout(() => this.renderPayPalButton(), 200);
      return;
    }
  
    // Nettoyer le conteneur
    paypalContainer.innerHTML = '';
  
    try {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '0.01' // Montant minimal pour la validation
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            // Extraire les informations PayPal
            const paypalInfo = {
              paypalName: details.payer.name.given_name + ' ' + details.payer.name.surname,
              paypalEmail: details.payer.email_address
            };
            
            // Pré-remplir le formulaire
            this.prefillFormWithPayPalData(paypalInfo);
          });
        },
        onError: (err: any) => {
          console.error('Erreur PayPal:', err);
          alert('Une erreur est survenue avec PayPal');
          // Réinitialiser le flag pour permettre un nouveau rendu
          this.paypalButtonRendered = false;
        },
        onCancel: (data: any) => {
          console.log('Paiement PayPal annulé');
          // Réinitialiser le flag pour permettre un nouveau rendu
          this.paypalButtonRendered = false;
        }
      }).render('#paypal-button-container').then(() => {
        this.paypalButtonRendered = true;
        console.log('Bouton PayPal rendu avec succès');
      }).catch((error: any) => {
        console.error('Erreur lors du rendu du bouton PayPal:', error);
        this.paypalButtonRendered = false;
      });
    } catch (error) {
      console.error('Erreur lors de la création du bouton PayPal:', error);
      this.paypalButtonRendered = false;
    }
  }

  onPaymentTypeChange(): void {
    // Réinitialiser le rendu PayPal
    this.paypalButtonRendered = false;
    
    // Nettoyer le conteneur PayPal si on change de type
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
      paypalContainer.innerHTML = '';
    }
    
    // Si PayPal est sélectionné et le SDK est chargé
    if (this.selectedPaymentType === 'paypal' && this.isPayPalLoaded) {
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        if (this.selectedPaymentType === 'paypal') { // Vérifier à nouveau
          this.renderPayPalButton();
        }
      }, 150);
    }
  }

  loadPayPalSDK(): void {
    if (window.paypal) {
      this.isPayPalLoaded = true;
      return;
    }
  
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=test&buyer-country=US&currency=USD&components=buttons&enable-funding=venmo,paylater,card';
    script.setAttribute('data-sdk-integration-source', 'developer-studio');
    
    script.onload = () => {
      this.isPayPalLoaded = true;
      console.log('SDK PayPal chargé avec succès');
      
      // Si PayPal est déjà sélectionné, rendre le bouton
      if (this.selectedPaymentType === 'paypal' && !this.paypalButtonRendered) {
        setTimeout(() => this.renderPayPalButton(), 100);
      }
    };
    
    script.onerror = () => {
      console.error('Erreur lors du chargement du SDK PayPal');
      this.isPayPalLoaded = false;
    };
    
    document.head.appendChild(script);
  }

  detectCardTypeFromPayPal(brand: string): string {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'visa';
      case 'mastercard':
      case 'master':
        return 'mastercard';
      case 'amex':
      case 'american_express':
        return 'amex';
      default:
        return 'visa'; // Par défaut
    }
  }

  prefillFormWithPayPalData(paypalInfo: any): void {
    // Si des informations de carte sont disponibles, utiliser le type de carte
    const cardType = paypalInfo.cardType || 'paypal';
    
    this.paymentForm.patchValue({
      cardType: cardType,
      // Champs PayPal
      paypalName: paypalInfo.paypalName,
      paypalEmail: paypalInfo.paypalEmail,
      // Champs carte si disponibles
      cardholderName: paypalInfo.cardholderName || '',
      cardNumber: paypalInfo.cardNumber || '',
      expiryMonth: paypalInfo.expiryMonth || '',
      expiryYear: paypalInfo.expiryYear || ''
    });
    
    // Mettre à jour le type sélectionné pour afficher les bons champs
    this.selectedPaymentType = cardType;
    this.updateValidators();
    
    // Afficher un message de succès
    const message = paypalInfo.cardType ? 
      'Informations de carte PayPal importées avec succès!' : 
      'Informations PayPal importées avec succès!';
    alert(message);
  }
}

interface PayPalCardInfo {
  paypalName: string;
  paypalEmail: string;
  cardType?: string;
  cardholderName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  billingAddress?: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

