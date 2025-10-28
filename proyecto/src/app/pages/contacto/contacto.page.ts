// src/app/pages/contacto/contacto.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from 'src/app/services/cart';
import { addIcons } from 'ionicons';
import { cart, logoInstagram, mail } from 'ionicons/icons';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ContactoPage {
  constructor(private cartService: CartService) {
    addIcons({ cart, logoInstagram, mail });
  }

  getCartCount(): number {
    return this.cartService.getItems().length;
  }
}