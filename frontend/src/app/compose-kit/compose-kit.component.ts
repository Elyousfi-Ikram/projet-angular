import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { CartService } from '../../services/cart.service';

import data from '../../data/infosKits.json';

@Component({
  selector: 'app-compose-kit',
  templateUrl: './compose-kit.component.html',
  styleUrls: ['./compose-kit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ComposeKitComponent {
  selectedCategorie = '';
  selectedProducts: string[] = [];
  categories = [...new Set(data.map(kit => kit.categorie))];
  selectedKit: any = null;
  kitProducts: { name: string; description: string }[] = [];

  // constructor(private cartService: CartService, private router: Router) {}

  get remainingProducts(): number {
    return 5 - this.selectedProducts.length;
  }

  isProductSelected(productName: string): boolean {
    return this.selectedProducts.includes(productName);
  }

  handleProductChange(productName: string) {
    const index = this.selectedProducts.indexOf(productName);

    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else if (this.selectedProducts.length < 5) {
      this.selectedProducts.push(productName);
    } else {
      alert('Vous ne pouvez sélectionner que 5 produits maximum');
    }
  }

  handleValidateComposition() {
    if (this.selectedProducts.length !== 5) {
      alert('Votre kit doit contenir exactement 5 produits');
      return;
    }

    const coverPath = this.selectedKit?.img?.replace('../../assets', '/assets');
    const customKit = {
      id: `custom-${Date.now()}`,
      type: 'kit',
      name: 'Kit Personnalisé',
      price: '24.99€',
      title: `Kit Personnalisé - ${this.selectedCategorie}`,
      categorie: this.selectedCategorie,
      cover: coverPath || '/assets/default-cover.png',
      kit: {
        title: 'Contenu du kit',
        products: this.selectedProducts.map(name => ({
          name,
          description: ''
        }))
      }
    };

    // this.cartService.addToCart(customKit);
    // this.router.navigate(['/products/panier']);
  }

  onCategoryChange(category: string) {
    this.selectedCategorie = category;
    
    // Récupérer tous les kits de la catégorie sélectionnée
    const categoryKits = data.filter(kit => kit.categorie === category);
    
    // Transformer en tableau de produits avec la structure attendue
    this.kitProducts = categoryKits.flatMap(kit => 
      kit.extrainfos?.kit?.content?.map(product => ({
        name: product.name,
        description: product.description,
        img: kit.img[0] // Prendre la première image du kit
      })) || []
    );
    
    this.selectedProducts = [];
  }
}
