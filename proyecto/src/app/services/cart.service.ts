// src/app/services/cart.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; // Asegúrate de tener rxjs instalado
import { AuthService } from './auth.service'; // Importa tu servicio de autenticación

export interface CartItem {
  id: number;
  name: string;
  size?: string; // Ej: 'Personal', 'Grande', 'Simple', 'Doble'
  price: number;
  quantity: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  // ✅ Nueva propiedad para almacenar el ID del usuario actual
  private currentUserId: number | null = null;

  constructor(private authService: AuthService) { // ✅ Inyecta AuthService
    this.initializeCart();
    // ✅ Escuchar cambios de autenticación para limpiar o cargar el carrito correcto
    this.authService.userChanged$.subscribe(user => { // Asume que tienes un observable userChanged$
      if (user) {
        // Usuario logueado
        this.currentUserId = user.id;
        this.loadCartForCurrentUser();
      } else {
        // Usuario deslogueado
        this.currentUserId = null;
        this.clearLocalCart(); // Opcional: limpiar carrito local al desloguearse
        this.cartItems = [];
        this.cartItemsSubject.next(this.cartItems);
      }
    });
  }

  // ✅ Método para inicializar el carrito
  private initializeCart() {
    const user = this.authService.getCurrentUser(); // Asume que tienes este método
    if (user) {
      this.currentUserId = user.id;
    }
    this.loadCartForCurrentUser();
  }

  // ✅ Método para cargar el carrito del usuario actual
  private loadCartForCurrentUser() {
    const key = this.getCartStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        this.cartItems = JSON.parse(saved);
      } catch (e) {
        console.error('Error al cargar el carrito del usuario:', this.currentUserId, e);
        this.cartItems = [];
      }
    } else {
      this.cartItems = []; // Si no hay carrito guardado para este usuario, inicializar vacío
    }
    this.cartItemsSubject.next(this.cartItems);
  }

  // ✅ Método para obtener la clave de almacenamiento basada en el usuario
  private getCartStorageKey(): string {
    if (this.currentUserId) {
      return `cart_user_${this.currentUserId}`; // Clave única por usuario
    }
    return 'cart_guest'; // Clave para invitados (si aplica)
  }

  // ✅ Método para guardar el carrito actual en la clave correcta
  private saveCart() {
    const key = this.getCartStorageKey();
    localStorage.setItem(key, JSON.stringify(this.cartItems));
  }

  // ✅ Método para limpiar el carrito *local* (no el del backend)
  private clearLocalCart() {
    const key = this.getCartStorageKey();
    if (key) {
      localStorage.removeItem(key);
    }
  }

  addToCart(item: CartItem) {
    const existingItem = this.cartItems.find(i => i.id === item.id && i.size === item.size);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cartItems.push({ ...item });
    }
    this.saveCart(); // ✅ Guardar después de añadir
    this.cartItemsSubject.next(this.cartItems);
  }

  getItems(): CartItem[] {
    return [...this.cartItems]; // Devuelve una copia
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  updateItemQuantity(index: number, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(index);
    } else {
      this.cartItems[index].quantity = newQuantity;
      this.saveCart(); // ✅ Guardar después de actualizar
      this.cartItemsSubject.next(this.cartItems);
    }
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.saveCart(); // ✅ Guardar después de eliminar
    this.cartItemsSubject.next(this.cartItems);
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart(); // ✅ Guardar después de limpiar
    this.cartItemsSubject.next(this.cartItems);
  }

  // ✅ Nuevo método para obtener el conteo total de items
  getCartCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }
}