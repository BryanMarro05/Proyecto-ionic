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
    path: 'pedidos',
    loadComponent: () => import('./pages/pedidos/pedidos.page').then(m => m.PedidosPage)
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
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}