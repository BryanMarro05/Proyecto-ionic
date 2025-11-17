// src/app/pages/inicio/inicio.page.ts
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from 'src/app/services/cart.service';
import { AuthService } from 'src/app/services/auth.service'; // ← NUEVO
// @ts-ignore
import { addIcons } from 'ionicons';
// @ts-ignore
import { cart } from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
    CommonModule
  ]
})
export class InicioPage implements OnInit {
  isLoggedIn = false; // ← NUEVO

  constructor(
    private cartService: CartService,
    private authService: AuthService // ← NUEVO
  ) {
    addIcons({ cart });
  }

  ngOnInit() {
    this.checkAuthStatus();
  }

  ionViewWillEnter() {
    // Se ejecuta cada vez que entras a la página
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  getCartCount(): number {
    return this.cartService.getItems().length;
  }

  // Configuración del carrusel
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    loop: true,
    spaceBetween: 10,
    centeredSlides: true
  };
}