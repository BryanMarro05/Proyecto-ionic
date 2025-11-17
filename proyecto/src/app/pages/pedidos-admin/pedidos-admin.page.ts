// src/app/pages/pedidos-admin/pedidos-admin.page.ts

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
  selector: 'app-pedidos-admin',
  templateUrl: './pedidos-admin.page.html',
  styleUrls: ['./pedidos-admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PedidosAdminPage implements OnInit {
  API_URL = 'http://localhost:8000/api';
  API_BASE_URL = 'http://localhost:8000'; // Base URL del backend

  pedidos: Pedido[] = [];

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
      message: 'Cargando pedidos...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      const response = await axios.get(`${this.API_URL}/pedidos`, { // Asumiendo que tu endpoint es /api/pedidos
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.pedidos = response.data; // Asignar directamente la respuesta
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      this.showAlert('Error', 'No se pudieron cargar los pedidos');
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
      `Cliente: ${pedido.user?.name || 'Anónimo'}\n` +
      `Email: ${pedido.user?.email || 'N/A'}\n` +
      `Total: $${pedido.total}\n` +
      `Fecha: ${new Date(pedido.created_at).toLocaleString()}\n` +
      `Estado: ${pedido.estado}\n\n` +
      `Items:\n${itemsList}`
    );
  }

async updatePedidoStatus(pedido: Pedido) {
  // ✅ Determinar el nuevo estado basado en el estado actual
  const nuevoEstado = pedido.estado === 'pendiente' ? 'completado' : 'pendiente';

  const alert = await this.alertController.create({
    header: 'Cambiar Estado',
    message: `¿Cambiar el estado del pedido #${pedido.id} a "${nuevoEstado}"?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Aceptar',
        handler: async () => {
          const loading = await this.loadingController.create({
            message: 'Actualizando...'
          });
          await loading.present();

          try {
            const token = this.authService.getToken();
            await axios.put(
              `${this.API_URL}/pedidos/${pedido.id}`,
              { estado: nuevoEstado },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // ✅ Actualizar el estado en la lista local (sin recargar todo)
            pedido.estado = nuevoEstado;

            this.showAlert('Éxito', `Estado del pedido actualizado a "${nuevoEstado}"`);
          } catch (error) {
            this.showAlert('Error', 'No se pudo actualizar el estado del pedido');
          } finally {
            await loading.dismiss();
          }
        }
      }
    ]
  });
  await alert.present();
}
  // ✅ Nuevo método para eliminar un pedido
  async deletePedido(pedido: Pedido) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Eliminar el pedido #${pedido.id} permanentemente?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...'
            });
            await loading.present();

            try {
              const token = this.authService.getToken();
              await axios.delete(
                `${this.API_URL}/pedidos/${pedido.id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );

              // ✅ Eliminar el pedido del array local
              this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);

              this.showAlert('Éxito', 'Pedido eliminado');
              // ❌ Ya no necesitamos this.loadPedidos() aquí, porque ya filtramos el pedido.
            } catch (error) {
              this.showAlert('Error', 'No se pudo eliminar el pedido');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
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