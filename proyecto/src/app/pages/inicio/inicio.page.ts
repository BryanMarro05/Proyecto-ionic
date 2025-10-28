// src/app/pages/inicio/inicio.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // ✅ Solo esto
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ Necesario para *ngIf
import { CartService } from 'src/app/services/cart';
import { addIcons } from 'ionicons';
import { cart } from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonicModule,     // ✅ Incluye IonButton, IonIcon, etc.
    RouterModule,
    CommonModule     // ✅ Necesario para *ngIf, *ngFor
  ]
})
export class InicioPage {
  constructor(private cartService: CartService) {
    addIcons({ cart });
  }

  getCartCount(): number {
    return this.cartService.getItems().length;
  }

  // Configuración del carrusel
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    loop: true,
    spaceBetween: 10,
    centeredSlides: true
  };
}