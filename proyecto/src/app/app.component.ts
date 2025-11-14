// src/app/app.component.ts
// src/app/app.component.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Importa esto

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule // ✅ Añade RouterModule aquí
  ]
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/inicio', icon: 'home' },
    { title: 'Menú', url: '/menu', icon: 'fast-food' },
    { title: 'Promociones', url: '/promociones', icon: 'pricetags' },
    { title: 'Ubicación', url: '/ubicacion', icon: 'location' },
    { title: 'Contacto', url: '/contacto', icon: 'call' }
  ];
}