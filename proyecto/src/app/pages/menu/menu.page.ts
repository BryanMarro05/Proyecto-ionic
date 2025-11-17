import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, cart, pizzaOutline, fastFoodOutline, beerOutline, restaurantOutline, trashOutline } from 'ionicons/icons'; // ✅ Importa los iconos específicos
import { CartService, CartItem } from 'src/app/services/cart.service'; // ✅ Asegúrate de importar CartService y CartItem
import axios from 'axios';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precioP?: number; // Precio Personal/Pequeño
  precioG?: number; // Precio Grande/Doble
  precio?: number;  // Precio Único (bebidas, hotdogs)
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
  notes: string; // Renombrado de 'notes' a 'notes' para consistencia, o 'instructions' si prefieres
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
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

  // ✅ Variables para almacenar los productos de cada categoría
  pizzas: Product[] = [];
  hamburguesas: Product[] = [];
  bebidas: Product[] = [];
  hotdogs: Product[] = [];

  // ✅ Variables para el carrito
  cartItems: CartItem[] = []; // ✅ Tipado correctamente con CartItem
  cartItemCount: number = 0; // ✅ Contador de items en el carrito

  // ✅ Información del pedido
  order: Order = {
    name: '',
    address: '',
    phone: '',
    notes: '' // Campo para instrucciones especiales
  };

  // ✅ Variables para el recibo
  showReceipt = false;
  receiptData: any = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private cartService: CartService // ✅ Inyecta CartService
  ) {
    // ✅ Registra los iconos específicos
    addIcons({ 
      'add': add,
      'cart': cart,
      'pizza-outline': pizzaOutline,
      'fast-food-outline': fastFoodOutline,
      'beer-outline': beerOutline,
      'restaurant-outline': restaurantOutline,
      'trash-outline': trashOutline
    });
  }

  async ngOnInit() {
    await this.loadProducts(); // ✅ Carga los productos al iniciar
    this.loadPendingCart(); // ✅ Carga carrito pendiente si existe
    this.loadCartItems(); // ✅ Carga los items del carrito actual

    // ✅ Suscribirse a cambios en el carrito para actualizar el contador
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartItemCount = this.cartService.getCartCount(); // ✅ Asume que tienes este método en el servicio
    });
  }

  // ✅ Método para cargar los items del carrito y calcular el conteo
  loadCartItems() {
    this.cartItems = this.cartService.getItems();
    // Calcular el conteo total de items (sumando cantidades)
    this.cartItemCount = this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  // ✅ Getter para el total del carrito (opcional, puedes usar directamente cartService.getTotal())
  get total(): number {
    return this.cartService.getTotal();
  }

  // ✅ Método para construir la URL de la imagen
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'https://placehold.co/60x60/1d1641/ffffff?text=Sin+Img';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Asegura que la ruta relativa se combine correctamente con la base
    // Asumiendo que la imagen se guarda como 'imagenes/productos/nombre.jpg' en Laravel
    // y el endpoint público es http://localhost:8000/storage/imagenes/productos/nombre.jpg
    // o http://localhost:8000/imagenes/productos/nombre.jpg
    // Ajusta esta lógica según cómo sirvas las imágenes en Laravel
    if (imagePath.startsWith('imagenes/') || imagePath.startsWith('storage/imagenes/')) {
        return `${this.API_BASE_URL}/storage/${imagePath}`; // Si usas storage:link
    } else if (imagePath.startsWith('images/')) {
        return `${this.API_BASE_URL}/${imagePath}`; // Si está en public directamente
    }
    // Por defecto, asumir que va directo a public o storage si no empieza con http
    return `${this.API_BASE_URL}/${imagePath}`;
  }

  // ✅ Método para cargar productos desde la API
  async loadProducts() {
    try {
      // Asumiendo que tus endpoints Laravel son /api/pizzas, /api/hamburguesas, etc.
      const [pResp, hResp, bResp, hdResp] = await Promise.all([
        axios.get(`${this.API_BASE_URL}/api/pizzas`),
        axios.get(`${this.API_BASE_URL}/api/hamburguesas`),
        axios.get(`${this.API_BASE_URL}/api/bebidas`),
        axios.get(`${this.API_BASE_URL}/api/hotdogs`)
      ]);

      // ✅ Asignar los datos a las variables correspondientes
      this.pizzas = pResp.data;
      this.hamburguesas = hResp.data;
      this.bebidas = bResp.data;
      this.hotdogs = hdResp.data;

    } catch (error) {
      console.error('Error al cargar productos desde la API:', error);
      this.presentErrorAlert('Error de Conexión', 'No se pudieron cargar los productos. Asegúrate de que la API esté corriendo.');
    }
  }

  // ✅ Método para cargar carrito pendiente (por ejemplo, si se intentó pagar sin estar logueado)
  loadPendingCart() {
    const pendingCart = localStorage.getItem('pendingCart');
    if (pendingCart) {
      try {
        const items: CartItem[] = JSON.parse(pendingCart);
        items.forEach(item => this.cartService.addToCart(item));
        localStorage.removeItem('pendingCart'); // ✅ Limpiar después de cargar
        
        const pendingOrderInfo = localStorage.getItem('pendingOrderInfo');
        if (pendingOrderInfo) {
          this.order = JSON.parse(pendingOrderInfo);
          localStorage.removeItem('pendingOrderInfo');
        }
      } catch (e) {
        console.error('Error al parsear carrito pendiente:', e);
        localStorage.removeItem('pendingCart');
        localStorage.removeItem('pendingOrderInfo');
      }
    }
  }

  // ✅ Método para agregar un producto al carrito
  addToCart(baseItem: Product, size?: string, price?: number) {
    const itemName = size ? `${baseItem.nombre} (${size})` : baseItem.nombre;
    const itemPrice = price !== undefined ? price : (baseItem.precio || baseItem.precioP || baseItem.precioG || 0);

    const item: CartItem = {
      id: baseItem.id,
      name: itemName,
      price: itemPrice,
      size: size,
      quantity: 1, // Inicialmente 1
      image: this.getImageUrl(baseItem.imagen || '') // Asegura que pase una cadena vacía si imagen es undefined
    };

    this.cartService.addToCart(item);
    // El contador se actualiza automáticamente gracias a la suscripción en ngOnInit
  }

  // ✅ Método para ir a la página del carrito
  goToCart() {
    this.router.navigate(['/carrito']);
  }

  // ✅ Método para vaciar el carrito
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
            this.cartService.clearCart();
            // El contador se actualiza automáticamente gracias a la suscripción
          },
        },
      ],
    });
    await alert.present();
  }

  // ✅ Método para procesar el pedido
  async placeOrder() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Guardar carrito y datos del pedido para recuperar después del login
      localStorage.setItem('pendingCart', JSON.stringify(this.cartService.getItems()));
      localStorage.setItem('pendingOrderInfo', JSON.stringify(this.order));
      
      await this.presentErrorAlert(
        'Acceso Requerido', 
        'Por favor, inicia sesión o regístrate para completar tu pedido.'
      );

      this.router.navigateByUrl('/login');
      return; 
    }

    if (this.cartService.getItems().length === 0) {
      await this.presentErrorAlert('Carrito Vacío', 'Tu carrito está vacío.');
      return;
    }
    
    // Preparar datos del recibo
    this.receiptData = {
      order: { ...this.order },
      cart: [ ...this.cartService.getItems() ], // Copia del carrito
      total: this.cartService.getTotal(),
      date: new Date().toLocaleString('es-SV') // Fecha y hora actual
    };
    this.showReceipt = true;
  }

  // ✅ Método para cerrar el recibo y limpiar el carrito
  closeReceipt() {
    this.showReceipt = false;
    this.cartService.clearCart(); // ✅ Limpia el carrito
    this.order = { name: '', address: '', phone: '', notes: '' }; // ✅ Resetea el formulario de pedido
    this.receiptData = null; // ✅ Limpia los datos del recibo
    // loadCartItems se llama automáticamente por la suscripción al observable
  }

  // ✅ Método para imprimir el recibo (abre el diálogo de impresión del navegador)
  printReceipt() {
    window.print();
  }

  // ✅ Método auxiliar para mostrar alertas de error
  async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // ✅ Método para cambiar la categoría activa con animación
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