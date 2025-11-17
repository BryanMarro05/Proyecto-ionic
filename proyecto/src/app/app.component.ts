import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { EventService } from './services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  userEmail = '';
  userMenuOpen = false;
  
  private authSubscription?: Subscription;

  public appPages = [
    { title: 'Inicio', url: '/inicio', icon: 'home' },
    { title: 'Menú', url: '/menu', icon: 'fast-food' },
    { title: 'Promociones', url: '/promociones', icon: 'pricetags' },
    { title: 'Ubicación', url: '/ubicacion', icon: 'location' },
    { title: 'Contacto', url: '/contacto', icon: 'call' }
  ];

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    
    // Suscribirse a cambios de autenticación (ej: login/logout)
    this.authSubscription = this.eventService.authChange$.subscribe(() => {
      this.checkAuthStatus();
    });
  }

  ngOnDestroy() {
    // Limpiar suscripción al destruir el componente
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.userName = user?.name || 'Usuario';
      this.userEmail = user?.email || 'email@dominio.com';
      this.isAdmin = this.authService.isAdmin();  
    } else {
      // Limpiar datos si no está logueado
      this.userName = '';
      this.userEmail = '';
      this.isAdmin = false;  
      this.userMenuOpen = false; // Cerrar menú desplegable
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  async logout() {
    this.userMenuOpen = false;
    await this.authService.logout();
    // El 'checkAuthStatus' se disparará automáticamente
    // gracias al 'eventService'
    this.router.navigate(['/inicio']); // O a donde quieras redirigir
  }
}