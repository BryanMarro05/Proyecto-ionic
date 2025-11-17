// src/app/app.routes.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// ✅ CORRECTO: define y exporta `routes`
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage)
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu.page').then(m => m.MenuPage)
  },
  {
    path: 'promociones',
    loadComponent: () => import('./pages/promociones/promociones.page').then(m => m.PromocionesPage)
  },
  {
    path: 'ubicacion',
    loadComponent: () => import('./pages/ubicacion/ubicacion.page').then(m => m.UbicacionPage)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPage)
  },
  {
  path: 'carrito',
  loadComponent: () => import('./pages/carrito/carrito.page').then(m => m.CarritoPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then( m => m.AdminPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil.page').then( m => m.MiPerfilPage)
  },
  {
    path: 'mis-pedidos',
    loadComponent: () => import('./pages/mis-pedidos/mis-pedidos.page').then( m => m.MisPedidosPage)
  },  {
    path: 'pedidos-admin',
    loadComponent: () => import('./pages/pedidos-admin/pedidos-admin.page').then( m => m.PedidosAdminPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  }





];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}