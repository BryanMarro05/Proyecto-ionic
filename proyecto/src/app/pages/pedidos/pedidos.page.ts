// src/app/pages/pedidos/pedidos.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from 'src/app/services/cart';
import { addIcons } from 'ionicons';
import { cart, logoWhatsapp } from 'ionicons/icons';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class PedidosPage {
  constructor(private cartService: CartService) {
    addIcons({ cart, logoWhatsapp });
  }

  getCartCount(): number {
    return this.cartService.getItems().length;
  }
}