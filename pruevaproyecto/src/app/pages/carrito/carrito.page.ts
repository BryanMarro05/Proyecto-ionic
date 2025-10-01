// src/app/pages/carrito/carrito.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // ✅ Importa esto

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule // ✅ Añade esto aquí
  ]
})
export class CarritoPage {
  cartItems: any[] = [];

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  clearCart() {
    this.cartItems = [];
    localStorage.removeItem('cart');
  }

  checkout() {
    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    const message = `
Hola Charlie Boy Pizza, quiero ordenar:
${this.cartItems.map(item => `- ${item.name} ($${item.price})`).join('\n')}
Total: $${this.getTotal().toFixed(2)}

Gracias!
`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/50370123456?text=${encodedMessage}`, '_blank');
  }
}