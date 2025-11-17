import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import axios from 'axios';

interface Product {
  id?: number;
  nombre: string;
  descripcion: string;
  precioP?: number;
  precioG?: number;
  precio?: number;
  imagen?: string; // Esta será la URL final guardada en la DB
  tipo: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit {
  API_URL = 'http://localhost:8000/api';
  API_BASE_URL = 'http://localhost:8000'; // Base URL del backend

  activeTab: string = 'pizzas';
  products: Product[] = [];

  // Formulario
  editMode: boolean = false;
  selectedProduct: Product | null = null;

  // Nuevas propiedades para manejar la imagen
  imageFile: File | null = null; // Archivo seleccionado desde el explorador
  imageUrl: string = ''; // URL ingresada manualmente
  previewUrl: string | null = null; // URL para previsualizar la imagen (puede ser la URL ingresada o una URL temporal del archivo)

  productForm: Product = {
    nombre: '',
    descripcion: '',
    tipo: 'pizzas'
  };

  // ✅ Tabs actualizados, sin 'pedidos'
  tabs = [
    { id: 'pizzas', label: 'Pizzas', icon: 'pizza' },
    { id: 'hamburguesas', label: 'Hamburguesas', icon: 'fast-food' },
    { id: 'bebidas', label: 'Bebidas', icon: 'beer' },
    { id: 'hotdogs', label: 'Hot Dogs', icon: 'restaurant' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    const loading = await this.loadingController.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      const response = await axios.get(`${this.API_URL}/${this.activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Transformar la respuesta para construir URLs completas para las imágenes
      this.products = response.data.map((product: Product) => {
        if (product.imagen) {
          if (!product.imagen.startsWith('http://') && !product.imagen.startsWith('https://')) {
            product.imagen = `${this.API_BASE_URL}/${product.imagen}`;
          }
          // Si ya es una URL completa, dejarla como está
        }
        return product;
      });

    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.showAlert('Error', 'No se pudieron cargar los productos');
    } finally {
      await loading.dismiss();
    }
  }

  // ✅ Método changeTab actualizado, sin lógica de 'pedidos'
  changeTab(tab: string) {
    this.activeTab = tab;
    this.productForm.tipo = tab;
    this.loadProducts();
    this.cancelEdit();
  }

  newProduct() {
    this.editMode = false;
    this.selectedProduct = null;
    this.productForm = {
      nombre: '',
      descripcion: '',
      tipo: this.activeTab
    };

    if (this.activeTab === 'pizzas' || this.activeTab === 'hamburguesas') {
      this.productForm.precioP = 0;
      this.productForm.precioG = 0;
    } else {
      this.productForm.precio = 0;
    }

    // Resetear campos de imagen
    this.imageFile = null;
    this.imageUrl = '';
    this.previewUrl = null;
  }

  editProduct(product: Product) {
    this.editMode = true;
    this.selectedProduct = product;
    this.productForm = { ...product };

    // Si el producto tiene una imagen, usarla como URL y previsualización
    if (product.imagen) {
      // La URL ya debería ser completa gracias a loadProducts
      this.imageUrl = product.imagen;
      this.previewUrl = this.imageUrl;
    } else {
      this.imageUrl = '';
      this.previewUrl = null;
    }
    this.imageFile = null; // No se puede recuperar el archivo original, solo la URL
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedProduct = null;
    this.newProduct();
  }

  // Manejar la selección de un archivo desde el explorador
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.imageFile = file;
      // Crear una URL temporal para previsualizar la imagen
      this.previewUrl = URL.createObjectURL(file);
      // Limpiar la URL manual si se sube un archivo
      this.imageUrl = '';
    }
  }

  // Manejar el cambio en el campo de URL
  onImageUrlChange() {
    // Si hay una URL válida, usarla para previsualizar
    if (this.imageUrl.trim()) {
      this.previewUrl = this.imageUrl;
      // Limpiar el archivo si se ingresa una URL
      this.imageFile = null;
    } else {
      this.previewUrl = null;
    }
  }

  async saveProduct() {
    if (!this.productForm.nombre || !this.productForm.descripcion) {
      this.showAlert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    const loading = await this.loadingController.create({
      message: this.editMode ? 'Actualizando...' : 'Guardando...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      let formData: FormData | any = null;

      // Decidir qué enviar
      if (this.imageFile) {
        // Si hay un archivo, usar FormData para enviarlo junto con los otros datos
        formData = new FormData();
        formData.append('nombre', this.productForm.nombre);
        formData.append('descripcion', this.productForm.descripcion);
        formData.append('tipo', this.productForm.tipo);

        if (this.activeTab === 'pizzas' || this.activeTab === 'hamburguesas') {
          formData.append('precioP', this.productForm.precioP?.toString() || '0');
          formData.append('precioG', this.productForm.precioG?.toString() || '0');
        } else {
          formData.append('precio', this.productForm.precio?.toString() || '0');
        }

        // Añadir el archivo de imagen
        formData.append('imagen', this.imageFile); // El nombre 'imagen' debe coincidir con lo que espera tu backend

        // Para editar, también necesitamos el ID
        if (this.editMode && this.selectedProduct?.id) {
          formData.append('id', this.selectedProduct.id.toString());
        }

      } else {
        // Si no hay archivo, enviar como JSON normal y usar la URL
        // Asegurarse de que el objeto productForm tenga la URL de la imagen
        this.productForm.imagen = this.imageUrl.trim() ? this.imageUrl.replace(this.API_BASE_URL + '/', '') : undefined; // Enviar solo la ruta relativa

        // Si estamos editando, asegurar que el ID esté presente
        if (this.editMode && this.selectedProduct?.id) {
          this.productForm.id = this.selectedProduct.id;
        }
      }

      if (this.editMode && this.selectedProduct?.id) {
        // Actualizar
        if (formData) {
          // Enviar con FormData (archivo)
          await axios.put(
            `${this.API_URL}/${this.activeTab}/${this.selectedProduct.id}`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // Importante para FormData
              }
            }
          );
        } else {
          // Enviar con JSON (solo URL)
          await axios.put(
            `${this.API_URL}/${this.activeTab}/${this.selectedProduct.id}`,
            this.productForm,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        this.showAlert('Éxito', 'Producto actualizado correctamente');
      } else {
        // Crear nuevo
        if (formData) {
          // Enviar con FormData (archivo)
          await axios.post(
            `${this.API_URL}/${this.activeTab}`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        } else {
          // Enviar con JSON (solo URL)
          await axios.post(
            `${this.API_URL}/${this.activeTab}`,
            this.productForm,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        this.showAlert('Éxito', 'Producto creado correctamente');
      }

      this.loadProducts(); // Recargar la lista para reflejar el cambio
      this.cancelEdit();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      this.showAlert('Error', error.response?.data?.message || 'No se pudo guardar el producto');
    } finally {
      await loading.dismiss();
    }
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Eliminar "${product.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...'
            });
            await loading.present();

            try {
              const token = this.authService.getToken();
              await axios.delete(
                `${this.API_URL}/${this.activeTab}/${product.id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );

              // ✅ Eliminar el producto del array local (más rápido que recargar todo)
              this.products = this.products.filter(p => p.id !== product.id);

              this.showAlert('Éxito', 'Producto eliminado');
              // ❌ Ya no necesitamos this.loadProducts() aquí, porque ya filtramos el producto.
            } catch (error) {
              this.showAlert('Error', 'No se pudo eliminar el producto');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
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