import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async onLogin() {
  // Validaciones
  if (!this.email || !this.password) {
    await this.showAlert('Error', 'Por favor completa todos los campos');
    return;
  }

  // Mostrar loading
  const loading = await this.loadingController.create({
    message: 'Iniciando sesión...',
    spinner: 'crescent'
  });
  await loading.present();

  // Intentar login
  const result = await this.authService.login(this.email, this.password);
  
  await loading.dismiss();

  if (result.success) {
    // ✅ IMPORTANTE: Usar replaceUrl para que no se pueda volver atrás
    if (this.authService.isAdmin()) {
      await this.router.navigateByUrl('/admin', { replaceUrl: true });
    } else {
      await this.router.navigateByUrl('/menu', { replaceUrl: true });
    }
  } else {
    await this.showAlert('Error de Login', result.message);
  }

  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }

  goToForgotPassword() {
    this.router.navigateByUrl('/forgot-password');
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