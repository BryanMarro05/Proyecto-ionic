// src/app/pages/promociones/promociones.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { addIcons } from 'ionicons';
import { cart } from 'ionicons/icons';

@Component({
  selector: 'app-promociones',
  templateUrl: './promociones.page.html',
  styleUrls: ['./promociones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class PromocionesPage {
  constructor(private cartService: CartService) {
    addIcons({ cart });
  }

  getCartCount(): number {
    return this.cartService.getItems().length;
  }
}