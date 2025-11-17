// src/app/pages/mis-pedidos/mis-pedidos.page.ts

import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import axios from 'axios';

interface Pedido {
  id: number;
  user_id: number;
  total: number;
  items: any[]; // Array de items del pedido
  estado: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  }; // Información del usuario relacionado
}

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MisPedidosPage implements OnInit {
  API_URL = 'http://localhost:8000/api';
  API_BASE_URL = 'http://localhost:8000'; // Base URL del backend

  pedidos: Pedido[] = [];
  userId: number | null = null; // Nueva propiedad para mostrar el ID del usuario

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadPedidos();
  }

  async loadPedidos() {
    const loading = await this.loadingController.create({
      message: 'Cargando tus pedidos...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      const response = await axios.get(`${this.API_URL}/mis-pedidos`, { // Asumiendo que tu endpoint es /api/mis-pedidos
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.pedidos = response.data;

      // ✅ Obtener el user_id del primer pedido (opcional)
      if (this.pedidos.length > 0) {
        this.userId = this.pedidos[0].user_id;
      }

    } catch (error) {
      console.error('Error al cargar tus pedidos:', error);
      this.showAlert('Error', 'No se pudieron cargar tus pedidos');
    } finally {
      await loading.dismiss();
    }
  }

  // ✅ Nuevo método para obtener la clase CSS según el estado
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'pedido-estado estado-pendiente';
      case 'completado':
        return 'pedido-estado estado-completado';
      case 'cancelado':
        return 'pedido-estado estado-cancelado';
      default:
        return 'pedido-estado estado-otro'; // Para estados no definidos
    }
  }

  // ✅ Nuevo método para ver detalles del pedido
  viewPedido(pedido: Pedido) {
    // Aquí puedes implementar la lógica para ver los detalles
    // Por ejemplo, mostrar un AlertController con los items
    console.log('Ver detalles del pedido:', pedido);

    // Ejemplo de cómo mostrar los items en una alerta
    let itemsList = '';
    if (pedido.items && Array.isArray(pedido.items)) {
      itemsList = pedido.items.map(item => 
        `- ${item.nombre || item.name} (x${item.cantidad || item.quantity}): $${item.precio || item.price}`
      ).join('\n');
    } else {
      itemsList = 'No hay items registrados.';
    }

    this.showAlert(
      `Detalles del Pedido #${pedido.id}`,
      `Total: $${pedido.total}\n` +
      `Fecha: ${new Date(pedido.created_at).toLocaleString()}\n` +
      `Estado: ${pedido.estado}\n\n` +
      `Items:\n${itemsList}`
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}