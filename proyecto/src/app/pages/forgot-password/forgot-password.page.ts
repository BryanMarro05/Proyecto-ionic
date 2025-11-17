// src/app/pages/forgot-password/forgot-password.page.ts

import { Component } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ForgotPasswordPage {
  API_URL = 'http://localhost:8000/api';
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async sendResetLink() {
    if (!this.email) {
      await this.showToast('Por favor, ingresa tu correo electrónico', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      await this.showToast('Por favor, ingresa un correo válido', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando enlace...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    try {
      // ✅ Cambiado a /forgot-password
      const response = await axios.post(`${this.API_URL}/forgot-password`, {
        email: this.email
      });

      console.log('Respuesta exitosa:', response.data);

      await this.showToast(
        'Se ha enviado un enlace de recuperación a tu correo electrónico', 
        'success'
      );

      this.email = '';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);

    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors?.email) {
          await this.showToast(errors.email[0], 'danger');
        } else {
          await this.showToast('Error de validación', 'danger');
        }
      } else {
        await this.showToast(
          error.response?.data?.message || 'Error al enviar el enlace. Verifica tu correo.',
          'danger'
        );
      }
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}