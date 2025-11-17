// src/app/pages/mi-perfil/mi-perfil.page.ts

import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Asegúrate de la ruta correcta
import axios from 'axios';

// ✅ INTERFAZ USER ACTUALIZADA: Permitir 'name' y 'email' como opcionales
interface User {
  id?: number;
  name?: string; // ✅ Cambiado de 'name: string' a 'name?: string'
  email?: string; // ✅ Cambiado de 'email: string' a 'email?: string'
  role?: string;
  created_at?: string;
}

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MiPerfilPage implements OnInit {
  API_URL = 'http://localhost:8000/api';

  // ✅ Variable inicializada como null
  user: User | null = null;
  // ✅ Asegura que editForm también use las mismas propiedades que la interfaz User
  editForm: User = {
    name: '',
    email: ''
  };

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    const loading = await this.loadingController.create({
      message: 'Cargando perfil...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      // Asumiendo que tienes un endpoint como /api/user para obtener la info del usuario autenticado
      const response = await axios.get(`${this.API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // ✅ Asignar directamente la respuesta
      this.user = response.data;

      // ✅ Inicializar el formulario con los datos del usuario, asegurando cadenas vacías si son undefined
      this.editForm = {
        name: this.user?.name || '',
        email: this.user?.email || '',
        role: this.user?.role,
        created_at: this.user?.created_at,
        id: this.user?.id
      };
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      this.showAlert('Error', 'No se pudo cargar la información del perfil');
    } finally {
      await loading.dismiss();
    }
  }

  async saveProfile() {
    // ✅ Verificar que editForm tenga 'name' y 'email' como cadenas vacías o valores válidos
    if (!this.editForm.name || !this.editForm.email) {
      this.showAlert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Actualizando...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      const payload = {
        name: this.editForm.name,
        email: this.editForm.email,
      };

      const response = await axios.put(`${this.API_URL}/user/update`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // ✅ Actualizar la vista local con la respuesta del backend
      // Asumiendo que el backend devuelve { user: { id, name, email, role, ... } }
      if (response.data.user) {
        this.user = response.data.user;
      } else {
        // Si no devuelve un objeto 'user', actualizamos con lo que mandamos
        this.user = { ...this.user, ...payload };
      }

      // ✅ Actualizar también editForm por si acaso
      this.editForm = { ...this.user };

      this.showAlert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al guardar perfil:', error);
      this.showAlert('Error', error.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      await loading.dismiss();
    }
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña actual'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña'
        },
        {
          name: 'confirmNewPassword',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cambiar',
          handler: async (data) => {
            if (data.newPassword !== data.confirmNewPassword) {
              this.showAlert('Error', 'La nueva contraseña y la confirmación no coinciden.');
              return false; // <-- Agregado return false
            }

            const loading = await this.loadingController.create({
              message: 'Cambiando contraseña...'
            });
            await loading.present();

            try {
              const token = this.authService.getToken();
              // ✅ CORRECCIÓN: Enviar también la confirmación de la nueva contraseña
              await axios.put(`${this.API_URL}/user/change-password`, {
                current_password: data.currentPassword,
                new_password: data.newPassword,
                new_password_confirmation: data.confirmNewPassword // <-- Añadido
              }, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              this.showAlert('Éxito', 'Contraseña cambiada correctamente');
              return true; // <-- Agregado return true
            } catch (error: any) {
              // ✅ MEJORA: Manejo específico de errores 422
              if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                let errorMessage = 'Errores de validación:\n';
                for (const field in errors) {
                  errorMessage += `- ${errors[field][0]}\n`; // Muestra el primer error de cada campo
                }
                this.showAlert('Error de Validación', errorMessage);
              } else {
                this.showAlert('Error', error.response?.data?.message || 'No se pudo cambiar la contraseña');
              }
              return false; // <-- Agregado return false
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
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