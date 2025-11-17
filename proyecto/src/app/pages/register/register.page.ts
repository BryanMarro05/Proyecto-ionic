import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {
  name: string = '';
  email: string = '';
  password: string = '';
  password_confirmation: string = '';
  showPassword: boolean = false;
  showPasswordConfirm: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async onRegister() {
    // Validaciones
    if (!this.name || !this.email || !this.password || !this.password_confirmation) {
      await this.showAlert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (this.password !== this.password_confirmation) {
      await this.showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 8) {
      await this.showAlert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    // Intentar registro
    const result = await this.authService.register(
      this.name,
      this.email,
      this.password,
      this.password_confirmation
    );
    
    await loading.dismiss();

    if (result.success) {
      await this.showAlert('¡Éxito!', 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } else {
      await this.showAlert('Error de Registro', result.message);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmVisibility() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
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