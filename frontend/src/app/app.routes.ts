import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { KitDetailComponent } from './kit-detail/kit-detail.component';
import { ComposeKitComponent } from './compose-kit/compose-kit.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { LoginComponent } from './login/login.component';
import { PasswordForgotComponent } from './password-forgot/password-forgot.component'
import { PasswordChangeComponent } from './password-change/password-change.component'

import { SignupComponent } from './signup/signup.component';
import { ProfilComponent } from './profil/profil.component';
// import { PanierComponent } from './panier/panier.component';
// import { FavorisComponent } from './favoris/favoris.component';

export const routes: Routes = [
  { path: 'accueil', component: HomeComponent },  // Route pour la page d'accueil
  { path: 'kits/:id', component: KitDetailComponent },  // Route avec paramètre
  { path: 'compose', component: ComposeKitComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product-detail/:id', component: ProductDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'password-forgot', component: PasswordForgotComponent },
  { path: 'password-reset/:token', component: PasswordChangeComponent },

    { path: 'profil', component: ProfilComponent },
    // { path: 'panier', component: PanierComponent },
  //   { path: 'favoris', component: FavorisComponent },
  { path: '**', redirectTo: 'accueil' }  // Redirection vers la page d'accueil
];
