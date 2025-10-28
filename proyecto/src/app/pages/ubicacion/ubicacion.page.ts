// src/app/pages/ubicacion/ubicacion.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from 'src/app/services/cart';
import { addIcons } from 'ionicons';
import { cart } from 'ionicons/icons';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class UbicacionPage {
  constructor(private cartService: CartService) {
    addIcons({ cart });
  }

  getCartCount(): number {
    return this.cartService.getItems().length;
  }
}