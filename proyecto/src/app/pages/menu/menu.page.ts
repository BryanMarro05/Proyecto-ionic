// src/app/pages/menu/menu.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from 'src/app/services/cart';
import { addIcons } from 'ionicons';
import { add, cart } from 'ionicons/icons';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule
  ]
})
export class MenuPage {

  constructor(private cartService: CartService) {
    // Registrar los íconos usados en esta página
    addIcons({
      add,
      cart
    });
  }

  /**
   * Devuelve la cantidad de productos en el carrito
   * Usado en el badge del ícono del carrito
   */
  getCartCount(): number {
    return this.cartService.getItems().length;
  }

  /**
   * Agrega un producto al carrito
   * @param item Objeto con { name: string, price: number }
   */
  addToCart(item: any): void {
    this.cartService.addToCart(item);
    alert(`${item.name} agregado al carrito`);
  }
}