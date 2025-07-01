import { Component } from '@angular/core';
import { BannerComponent } from './banner/banner.component';
import { RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    BannerComponent,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}