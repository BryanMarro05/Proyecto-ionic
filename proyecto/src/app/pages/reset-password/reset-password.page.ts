// src/app/pages/reset-password/reset-password.page.ts

import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ResetPasswordPage implements OnInit {
  API_URL = 'http://localhost:8000/api';
  
  email: string = '';
  token: string = '';
  password: string = '';
  passwordConfirmation: string = '';
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  
  passwordStrength: string = '';
  passwordStrengthText: string = '';

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener token y email de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      
      console.log('Token:', this.token);
      console.log('Email:', this.email);
      
      if (!this.token || !this.email) {
        this.showAlert(
          'Error',
          'El enlace de recuperación es inválido o ha expirado.'
        );
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Calcular fortaleza de la contraseña
  getPasswordStrengthPercent(): number {
    const length = this.password.length;
    const hasLower = /[a-z]/.test(this.password);
    const hasUpper = /[A-Z]/.test(this.password);
    const hasNumber = /\d/.test(this.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
    
    let strength = 0;
    if (length >= 8) strength += 25;
    if (hasLower) strength += 25;
    if (hasUpper) strength += 25;
    if (hasNumber) strength += 12.5;
    if (hasSpecial) strength += 12.5;
    
    if (strength <= 25) {
      this.passwordStrength = 'weak';
      this.passwordStrengthText = 'Débil';
    } else if (strength <= 50) {
      this.passwordStrength = 'medium';
      this.passwordStrengthText = 'Media';
    } else if (strength <= 75) {
      this.passwordStrength = 'good';
      this.passwordStrengthText = 'Buena';
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthText = 'Fuerte';
    }
    
    return strength;
  }

  async resetPassword() {
    // Validaciones
    if (!this.password || !this.passwordConfirmation) {
      await this.showToast('Por favor, completa todos los campos', 'warning');
      return;
    }

    if (this.password.length < 8) {
      await this.showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
      return;
    }

    if (this.password !== this.passwordConfirmation) {
      await this.showToast('Las contraseñas no coinciden', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Restableciendo contraseña...',
      spinner: 'crescent'
    });
    await loading.present();

    this.isLoading = true;

    try {
      const response = await axios.post(`${this.API_URL}/reset-password`, {
        email: this.email,
        token: this.token,
        password: this.password,
        password_confirmation: this.passwordConfirmation
      });

      console.log('Respuesta exitosa:', response.data);

      await this.showSuccessAlert();

    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors?.password) {
          await this.showToast(errors.password[0], 'danger');
        } else if (errors?.email) {
          await this.showToast(errors.email[0], 'danger');
        } else if (errors?.token) {
          await this.showToast('El token es inválido o ha expirado', 'danger');
        } else {
          await this.showToast('Error de validación', 'danger');
        }
      } else if (error.response?.status === 400) {
        await this.showToast(error.response.data.message, 'danger');
      } else {
        await this.showToast(
          error.response?.data?.message || 'Error al restablecer la contraseña',
          'danger'
        );
      }
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: '¡Éxito!',
      message: 'Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Ir al Login',
          handler: () => {
            this.router.navigate(['/login']);
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