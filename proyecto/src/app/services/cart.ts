// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];

  constructor() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        this.cartItems = JSON.parse(saved);
      } catch (e) {
        console.error('Error al cargar el carrito:', e);
        this.cartItems = [];
      }
    }
  }

  addToCart(item: any) {
    this.cartItems.push(item);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  getItems() {
    return this.cartItems;
  }

  getTotal() {
    return this.cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  clearCart() {
    this.cartItems = [];
    localStorage.removeItem('cart');
  }
}