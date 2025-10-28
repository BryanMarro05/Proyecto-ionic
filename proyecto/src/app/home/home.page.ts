import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,IonButton, IonIcon],
})
export class HomePage {

  specialties = [
    {
      name: 'Charlie Classic Pizza',
      description: 'Tomato sauce, mozzarella, pepperoni, mushrooms, and our secret herb blend.',
      icon: '🍕'
    },
    {
      name: 'Grill Master Burger',
      description: 'Angus beef, cheddar, bacon, caramelized onions, and house-made BBQ sauce.',
      icon: '🍔'
    },
    {
      name: 'Truffle Pasta',
      description: 'Fresh fettuccine with truffle oil, parmesan, and wild mushrooms.',
      icon: '🍝'
    },
    {
      name: 'Tiramisu',
      description: 'Authentic Italian dessert with espresso, mascarpone, and cocoa.',
      icon: '🍰'
    }
  ];

  testimonials = [
    {
      text: 'The best pizza I’ve ever had in El Salvador! The crust is perfect.',
      author: 'María G.'
    },
    {
      text: 'Family dinner here every Friday. The kids love the garlic knots!',
      author: 'Carlos R.'
    },
    {
      text: 'Worth every bite. The grill burgers are next level.',
      author: 'Ana L.'
    }
  ];
  galleryItems = [
    {
      src: 'assets/gallery/pizza-1.jpg',
      alt: 'Charlie Classic Pizza'
    },
    {
      src: 'assets/gallery/burger-1.jpg',
      alt: 'Grill Master Burger'
    },
    {
      src: 'assets/gallery/pasta-1.jpg',
      alt: 'Truffle Pasta'
    },
    {
      src: 'assets/gallery/dessert-1.jpg',
      alt: 'Tiramisu'
    }
  ];

  constructor() {}
}
