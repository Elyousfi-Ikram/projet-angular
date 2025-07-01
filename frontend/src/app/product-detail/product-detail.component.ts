import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import productsData from '../../data/infosProducts.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProductDetailComponent implements OnInit {
  id: string | null = null;
  product: any;
  selectedQuantity: any = null;
  quantity: number = 1;
  message: string = '';
  openIndex: number | null = null;
  objectKeys = Object.keys;
  Array = Array;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.product = productsData.find(p => p.id.toString() === this.id);

      if (this.product?.quantite?.length) {
        this.selectedQuantity = this.product.quantite[0];
      }
    });
  }

  isObject(item: any): boolean {
    return item !== null && typeof item === 'object';
  }

  navigateBack() {
    this.router.navigate(['../']);
  }

  handleQuantityChange(event: any): void {
    const selected = this.product.quantite.find((q: any) => q.size === event.target.value);
    this.selectedQuantity = selected;
  }

  handleIncrement(): void {
    this.quantity++;
  }

  handleDecrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  handleAddToCart(): void {
    if (!this.selectedQuantity) return;
    this.message = "Produit ajouté au panier !";
    setTimeout(() => this.message = '', 2000);
  }

  handleAddToFavoris(): void {
    this.message = "Produit ajouté aux favoris !";
    setTimeout(() => this.message = '', 2000);
  }

  toggleCollapse(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  selectQuantity(q: any) {
    this.selectedQuantity = q;
  }
}

