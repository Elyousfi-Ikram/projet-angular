import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import produitsData from '../../data/infosProducts.json';

interface Product {
  id: number; 
  category: string;
  img: string;
  product: string;
  description: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  selectedCategory: string = 'Tous';
  categories: string[] = ['Tous', 'Bougie', 'Bijoux', 'Couture', 'Peinture', 'Savon'];
  filteredProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private cartService: CartService,
    // private favorisService: FavorisService
  ) { }

  ngOnInit(): void {
    this.filterProducts();
  }

  navigateBack() {
    this.router.navigate(['../']);
  }

  setSelectedCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

  filterProducts(): void {
    this.filteredProducts = this.selectedCategory === 'Tous'
      ? produitsData
      : produitsData.filter(product => product.category === this.selectedCategory);
  }
}
