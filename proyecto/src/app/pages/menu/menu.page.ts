import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import axios from 'axios';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precioP?: number;
  precioG?: number;
  precio?: number;
  ingredientes?: string;
  tipo?: string;
  size?: string;
  price?: number;
  quantity?: number;
}

interface Order {
  name: string;
  address: string;
  phone: string;
  notes: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MenuPage implements OnInit {

  API_BASE_URL = 'http://localhost:8000'; 
  activeCategory = 'pizzas';
  previousCategory = 'pizzas';
  
  slideLeft = false;
  slideRight = false;
  
  categories = [
    { id: 'pizzas', label: 'Pizzas', icon: 'pizza-outline' },
    { id: 'hamburguesas', label: 'Burgers', icon: 'fast-food-outline' },
    { id: 'bebidas', label: 'Bebidas', icon: 'beer-outline' },
    { id: 'hotdogs', label: 'Hot Dogs', icon: 'restaurant-outline' },
  ];

  pizzas: Product[] = [];
  hamburguesas: Product[] = [];
  bebidas: Product[] = [];
  hotdogs: Product[] = [];
  
  cart: Product[] = [];
  cartOpen = false;
  order: Order = {
    name: '',
    address: '',
    phone: '',
    notes: ''
  };

  showReceipt = false;
  receiptData: any = null;

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ 
      'add': icons.add,
      'cart': icons.cart,
      'pizza-outline': icons.pizzaOutline,
      'fast-food-outline': icons.fastFoodOutline,
      'beer-outline': icons.beerOutline,
      'restaurant-outline': icons.restaurantOutline,
      'trash-outline': icons.trashOutline
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadPendingCart();
  }

  get total(): number {
    return this.cart.reduce((sum, item) => sum + (item.price! * item.quantity!), 0);
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity!, 0);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'https://placehold.co/300x200/1d1641/ffffff?text=Sin+Imagen';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${this.API_BASE_URL}/${imagePath}`;
  }

  async loadProducts() {
    try {
      const [pResp, hResp, bResp, hdResp] = await Promise.all([
        axios.get(`${this.API_BASE_URL}/api/pizzas`),
        axios.get(`${this.API_BASE_URL}/api/hamburguesas`),
        axios.get(`${this.API_BASE_URL}/api/bebidas`),
        axios.get(`${this.API_BASE_URL}/api/hotdogs`)
      ]);

      this.pizzas = pResp.data;
      this.hamburguesas = hResp.data;
      this.bebidas = bResp.data;
      this.hotdogs = hdResp.data;

    } catch (error) {
      console.error('Error al cargar productos desde la API:', error);
      this.presentErrorAlert('Error de Conexión', 'No se pudieron cargar los productos. Asegúrate de que la API esté corriendo.');
    }
  }

  loadPendingCart() {
    const pendingCart = localStorage.getItem('pendingCart');
    if (pendingCart) {
      this.cart = JSON.parse(pendingCart);
      localStorage.removeItem('pendingCart'); 
      
      const pendingOrderInfo = localStorage.getItem('pendingOrderInfo');
      if (pendingOrderInfo) {
        this.order = JSON.parse(pendingOrderInfo);
        localStorage.removeItem('pendingOrderInfo');
      }
      
      this.cartOpen = true;
    }
  }

  addToCart(baseItem: Product, size: string, price: number | undefined) {
    const item = { ...baseItem, size: size, price: price };

    const existingItem = this.cart.find(i => i.id === item.id && i.size === item.size);
    if (existingItem) {
      existingItem.quantity!++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  removeFromCart(itemToRemove: Product) {
    this.cart = this.cart.filter(item => {
      return !(item.id === itemToRemove.id && item.size === itemToRemove.size);
    });
  }

  updateQuantity(item: Product, change: number) {
    item.quantity! += change;
    if (item.quantity! <= 0) {
      this.removeFromCart(item);
    }
  }

  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Vaciar Carrito',
      message: '¿Estás seguro de vaciar el carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Vaciar',
          handler: () => {
            this.cart = [];
          },
        },
      ],
    });
    await alert.present();
  }

  async placeOrder() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      localStorage.setItem('pendingCart', JSON.stringify(this.cart));
      localStorage.setItem('pendingOrderInfo', JSON.stringify(this.order));
      
      await this.presentErrorAlert(
        'Acceso Requerido', 
        'Por favor, inicia sesión o regístrate para completar tu pedido.'
      );

      this.cartOpen = false;
      this.router.navigateByUrl('/login');
      return; 
    }

    if (this.cart.length === 0) {
      this.presentErrorAlert('Carrito Vacío', 'Tu carrito está vacío.');
      return;
    }
    
    this.receiptData = {
      order: { ...this.order },
      cart: [ ...this.cart ],
      total: this.total,
      date: new Date().toLocaleString('es-SV')
    };
    this.showReceipt = true;
    this.cartOpen = false;
  }

  closeReceipt() {
    this.showReceipt = false;
    this.cart = [];
    this.order = { name: '', address: '', phone: '', notes: '' };
    this.receiptData = null;
  }

  printReceipt() {
    window.print();
  }

  async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  changeCategory(category: string) {
    if (category === this.activeCategory) return;

    this.slideLeft = category > this.activeCategory;
    this.slideRight = category < this.activeCategory;

    this.previousCategory = this.activeCategory;

    setTimeout(() => {
      this.activeCategory = category;
    }, 150);

    setTimeout(() => {
      this.slideLeft = false;
      this.slideRight = false;
    }, 300);
  }
}