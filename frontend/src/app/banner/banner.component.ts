import { Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Importez OnDestroy et ChangeDetectorRef
import { Router, RouterModule } from '@angular/router'; // Importez RouterModule
import { faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart, faUser as faRegularUser } from '@fortawesome/free-regular-svg-icons';
import { FormsModule } from '@angular/forms'; // Importez FormsModule
import { CommonModule } from '@angular/common'; // Importez CommonModule pour les directives comme *ngIf
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Si vous utilisez le module pour les icônes

// Importation des données JSON
import kitsData from '../../data/infosKits.json';
import produitsData from '../../data/infosProducts.json';

// Supposons qu'un service de panier existe
// import { CartService } from '../../services/cart.service';

import { AuthService } from '../services/auth.service'; // Assurez-vous que le chemin est correct
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-banner',
  standalone: true, // Assurez-vous que c'est bien un composant standalone
  imports: [
    CommonModule, // Ajoutez CommonModule
    FormsModule, // Ajoutez FormsModule
    FontAwesomeModule, // Ajoutez FontAwesomeModule
    RouterModule // Ajoutez RouterModule ici
  ],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy { // Implémentez OnDestroy
  // Icônes FontAwesome
  faMagnifyingGlass = faMagnifyingGlass;
  faHeart = faRegularHeart;
  faUser = faRegularUser;

  // Propriétés du composant (équivalent de l'état React)
  searchQuery = '';
  searchResults: { kits: any[]; produits: any[] } = { kits: [], produits: [] };
  isSearching = false;
  showKits = false;
  showLogin = false;
  user: any = null;
  kits = kitsData;
  produits = produitsData;
  displayedKits: any[] = [];
  isLoggedIn: boolean = false; // Nouvelle propriété pour suivre l'état de connexion
  private userSubscription!: Subscription;
  private authSubscription!: Subscription; // Ajouter une nouvelle souscription
  
  // Supposons que cartItems vient d'un service
  // cartItems = this.cartService.getItems(); 

  // Références aux éléments du DOM (équivalent de useRef)
  @ViewChild('searchContainer') searchContainer!: ElementRef;
  @ViewChild('kitsContainer') kitsContainer!: ElementRef;
  @ViewChild('loginContainer') loginContainer!: ElementRef;

  private searchTimeout: any;

  // Injection des services Angular
  constructor(
    private router: Router,
    private authService: AuthService, // Injectez AuthService
    private cdr: ChangeDetectorRef // Injectez ChangeDetectorRef
    // private cartService: CartService 
  ) {}

  ngOnInit(): void {
    this.displayedKits = this.kits;

    // S'abonner à l'état de connexion
    this.authSubscription = this.authService.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
      this.cdr.detectChanges(); // Forcer la détection des changements
    });

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.cdr.detectChanges(); // Forcer la détection des changements
    });

    // Plus besoin de l'event listener 'storage' ni de checkUserAuth()
  }

  // Gère les changements dans la barre de recherche avec un délai
  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = { kits: [], produits: [] };
      return;
    }

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.isSearching = true;

    this.searchTimeout = setTimeout(() => {
      const query = this.searchQuery.toLowerCase().trim();
      const kitsFiltered = this.kits.filter(
        (kit: any) =>
          kit.title?.toLowerCase().includes(query) ||
          kit.description?.toLowerCase().includes(query)
      );
      const produitsFiltered = this.produits.filter(
        (p: any) =>
          p.products?.toLowerCase().includes(query) ||
          p.marque?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );

      this.searchResults = {
        kits: kitsFiltered,
        produits: produitsFiltered,
      };
      this.isSearching = false;
    }, 300);
  }

  // Soumission du formulaire de recherche
  onSearchSubmit(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchResults = { kits: [], produits: [] };
      this.searchQuery = '';
    }
  }

  // Clic sur un résultat de recherche
  onResultClick(type: string, id: string): void {
    this.searchQuery = '';
    this.searchResults = { kits: [], produits: [] };
    this.router.navigate([type === 'kit' ? `/kits/${id}` : `/product/${id}`]);
  }

  // Affiche ou masque la liste des kits
  toggleKits(): void {
    this.showKits = !this.showKits;
  }

  // Affiche ou masque le menu de connexion
  toggleLogin(): void {
    this.showLogin = !this.showLogin;
  }

  // Déconnexion de l'utilisateur
  handleLogout(): void {
    this.authService.logout();
    this.showLogin = false;
    this.router.navigate(['/']);
  }

  // La méthode checkUserAuth() peut être supprimée.

  // Gère les clics en dehors des menus pour les fermer
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(target)) {
      this.searchResults = { kits: [], produits: [] };
    }
    if (this.showKits && this.kitsContainer && !this.kitsContainer.nativeElement.contains(target)) {
      this.showKits = false;
    }
    if (this.showLogin && this.loginContainer && !this.loginContainer.nativeElement.contains(target)) {
      this.showLogin = false;
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}