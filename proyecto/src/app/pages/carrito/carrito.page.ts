// src/app/pages/carrito/carrito.page.ts

import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { AuthService } from 'src/app/services/auth.service';
import axios from 'axios';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule
  ]
})
export class CarritoPage implements OnInit {
  API_URL = 'http://localhost:8000/api';

  cartItems: any[] = [];

  constructor(
    private cartService: CartService,
    public authService: AuthService, // ✅ Debe ser 'public' para acceder desde la plantilla
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartItems = this.cartService.getItems();
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  formatPrice(value: any): string {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return num.toFixed(2);
  }

  // ✅ Método para disminuir la cantidad
  decreaseQuantity(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity -= 1;
      this.saveCart(); // Guarda el carrito en localStorage
    } else {
      // Si la cantidad es 1, elimina el producto
      this.removeItem(index);
    }
  }

  // ✅ Método para aumentar la cantidad
  increaseQuantity(index: number) {
    this.cartItems[index].quantity += 1;
    this.saveCart(); // Guarda el carrito en localStorage
  }

  // ✅ Método para guardar el carrito en localStorage
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  removeItem(index: number) {
    this.cartService.removeItem(index);
    this.loadCart();
  }

  clearCart() {
    this.cartService.clearCart();
    this.loadCart();
  }

  async checkout() {
    // ✅ VERIFICACIÓN: ¿El usuario está logueado?
    if (!this.authService.isLoggedIn()) {
      const alert = await this.alertController.create({
        header: 'Iniciar Sesión Requerido',
        message: 'Debes iniciar sesión primero para poder realizar un pedido.',
        buttons: [
          {
            text: 'Iniciar Sesión',
            handler: () => {
              // Navegar a la página de login
              this.authService.logout(); // Opcional: limpiar cualquier estado parcial
              window.location.href = '/login'; // O usa Router para navegar
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      });
      await alert.present();
      return; // Salir sin hacer nada más
    }

    // ✅ Si está logueado, proceder con el checkout
    if (this.cartService.getItems().length === 0) {
      const alert = await this.alertController.create({
        header: 'Carrito Vacío',
        message: 'Tu carrito está vacío.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // ✅ Enviar pedido al backend
    await this.sendOrderToBackend();
  }

  // ✅ Nuevo método para enviar el pedido al backend
  private async sendOrderToBackend() {
    const loading = await this.loadingController.create({
      message: 'Procesando pedido...'
    });
    await loading.present();

    try {
      const cart = this.cartService.getItems();
      const total = this.cartService.getTotal();
      const token = this.authService.getToken();

      // Enviar el pedido al backend
      const response = await axios.post(`${this.API_URL}/pedidos`, {
        items: cart.map(item => ({
          id: item.id,
          nombre: item.name,
          precio: item.price,
          cantidad: item.quantity,
        })),
        total: total
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // ✅ Obtener los datos del pedido confirmado del backend
      const pedidoConfirmado = response.data.pedido; // Ajusta según la estructura real de tu respuesta

      // ✅ Vacía el carrito
      this.cartService.clearCart();
      this.loadCart();

      // ✅ Generar y abrir el recibo
      this.openReceipt(pedidoConfirmado, cart, total);

    } catch (error: any) {
      console.error('Error al enviar pedido:', error);
      let errorMessage = 'No se pudo procesar tu pedido. Por favor, intenta nuevamente.';
      if (error.response) {
        // Si el backend devolvió un error específico
        errorMessage = error.response.data.message || errorMessage;
        console.error('Respuesta de error del backend:', error.response.data);
      }
      const alert = await this.alertController.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  // ✅ Nuevo método para generar y abrir el recibo
  private openReceipt(pedido: any, cart: any[], total: number) {
    // Fecha y hora actual
    const now = new Date();

    // HTML del recibo
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo de Pedido #${pedido.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f9f9f9;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #d32f2f; /* Color rojo para coincidir con tu tema */
          }
          .info {
            margin-bottom: 20px;
          }
          .info p {
            margin: 5px 0;
          }
          .items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items th, .items td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          .items th {
            background-color: #f2f2f2;
          }
          .total {
            text-align: right;
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Charlie Boys</h1>
          <p>Pizza & Grill</p>
        </div>

        <div class="info">
          <p><strong>ID de Pedido:</strong> #${pedido.id}</p>
          <p><strong>Cliente:</strong> ${this.authService.getCurrentUser()?.name || 'Usuario'}</p>
          <p><strong>Correo:</strong> ${this.authService.getCurrentUser()?.email || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${now.toLocaleString()}</p>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${this.formatPrice(item.price)}</td>
                <td>$${this.formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <p>Total: $${this.formatPrice(total)}</p>
        </div>

        <div class="footer">
          <p>Gracias por su compra. ¡Vuelva pronto!</p>
          <p>Charlie Boys - Pizza & Grill</p>
        </div>
      </body>
      </html>
    `;

    // ✅ Abrir una nueva ventana con el recibo
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      // ✅ Opcional: Intentar imprimir automáticamente
      printWindow.print();
      // printWindow.close(); // Cierra la ventana después de imprimir (opcional)
    }
  }
}