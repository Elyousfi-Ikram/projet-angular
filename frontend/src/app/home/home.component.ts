import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Importez Router ici
import { ContactComponent } from '../contact/contact.component';

import kits from '../../data/infosKits.json';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ContactComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  images = [
    'assets/bijoux-aid.png',
    'assets/bougie-aid.png',
    'assets/savon-aid.png',
    'assets/couture-aid.png'
  ];

  currentIndex = 0;
  fade = false;
  displayedKits = kits.slice(0, 5);
  mainImage = this.displayedKits[0];
  private interval: any;

  // Injectez le Router dans le constructeur
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  prevImage(): void {
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
  }

  nextImage(): void {
    this.currentIndex = this.currentIndex === this.images.length - 1 ? 0 : this.currentIndex + 1;
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  private startCarousel(): void {
    this.interval = setInterval(() => {
      this.currentIndex = this.currentIndex === this.images.length - 1 ? 0 : this.currentIndex + 1;
    }, 5000);
  }

  goToKit(id: string): void {
    this.router.navigate(['/kits', id]);
  }
}
