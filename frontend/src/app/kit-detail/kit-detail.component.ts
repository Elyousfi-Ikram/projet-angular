import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import data from '../../data/infosKits.json';
// import { CartService } from '../../services/cart.service';
// import { FavorisService } from '../../services/favoris.service';

@Component({
  selector: 'app-kit-detail',
  templateUrl: './kit-detail.component.html',
  styleUrls: ['./kit-detail.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class KitDetailComponent {
  id: string | null = null;
  kit: any;
  whyChoiseKits: any;
  create: any;
  advice: any;
  message: string = '';
  currentIndex: number = 0;
  openIndex: number | null = null;

  // Dans la classe :
  constructor(private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      const kitId = params['id'];
      this.loadKitData(kitId); // Rechargez les données du kit ici
    });
  }
  get images(): string[] {
    return this.kit?.img || [];
  }

  navigateBack() {
    this.router.navigate(['../']);
  }

  changeImage(direction: 'next' | 'prev'): void {
    const length = this.images.length;
    if (direction === 'next') {
      this.currentIndex = (this.currentIndex + 1) % length;
    } else {
      this.currentIndex = (this.currentIndex - 1 + length) % length;
    }
  }

  setImage(index: number): void {
    this.currentIndex = index;
  }

  toggleCollapse(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }

  handleAddToCart(): void {
    // this.cartService.addToCart({
    //   id: this.kit.id,
    //   type: 'kit',
    //   name: this.kit.title,
    //   price: this.kit.price,
    //   image: this.kit.cover || this.kit.img[0]
    // });
    this.message = 'Produit ajouté au panier !';
    setTimeout(() => this.message = '', 2000);
  }

  handleAddToFavoris(): void {
    // this.favorisService.addToFavoris({
    //   id: this.kit.id,
    //   type: 'kit',
    //   name: this.kit.title,
    //   price: this.kit.price,
    //   image: this.kit.cover || this.kit.img[0]
    // });
    this.message = 'Produit ajouté aux favoris !';
    setTimeout(() => this.message = '', 2000);
  }

  loadKitData(kitId: string): void {
    // Trouver le kit correspondant dans les données
    const foundKit = data.find((k: any) => k.id === kitId);
    
    if (foundKit) {
      this.kit = foundKit;
      // Supprimer ces lignes car les données sont déjà dans this.kit.extrainfos
      // this.whyChoiseKits = foundKit.whyChoiseKits;
      // this.create = foundKit.create;
      // this.advice = foundKit.advice;
    } else {
      // Gérer le cas où le kit n'est pas trouvé
      console.error(`Kit with id ${kitId} not found`);
      // Vous pourriez aussi rediriger vers une page 404 ici
    }
  }

  getDefaultTitle(section: string): string {
    const titles: Record<string, string> = {
      'kit': 'Contenu du kit',
      'choices': 'Avantages',
      'advice': 'Conseils',
      'create': 'Ce que vous pouvez créer'
    };
    return titles[section] || '';
  }
}
