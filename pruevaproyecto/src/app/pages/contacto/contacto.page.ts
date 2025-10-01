import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logoWhatsapp, logoInstagram, mail } from 'ionicons/icons';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class ContactoPage {
  constructor() {
    addIcons({ logoWhatsapp, logoInstagram, mail });
  }
}