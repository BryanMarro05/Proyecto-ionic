import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs'; // ✅ Importa BehaviorSubject
import axios from 'axios';
import { EventService } from './event.service'; // ← Asumiendo que este servicio maneja otros eventos

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:8000/api';
  private currentUser: User | null = null;

  // ✅ Nuevo: BehaviorSubject y Observable para notificar cambios de usuario
  private userChangedSubject = new BehaviorSubject<User | null>(this.currentUser);
  userChanged$ = this.userChangedSubject.asObservable();

  constructor(
    private router: Router,
    private eventService: EventService // ← NUEVO
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        // ✅ Notificar que el usuario ha sido cargado desde el storage
        this.userChangedSubject.next(this.currentUser);
      } catch (e) {
        console.error('Error al parsear el usuario del localStorage:', e);
        this.logout(); // Si hay error, limpiar sesión
      }
    } else {
        // ✅ Notificar que no hay usuario (null)
        this.userChangedSubject.next(null);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post<LoginResponse>(`${this.API_URL}/login`, {
        email,
        password
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.currentUser = response.data.user;

        // ✅ Emitir evento de cambio de autenticación (ahora también a través del Subject)
        this.userChangedSubject.next(this.currentUser);
        this.eventService.publishAuthChange(true); // ← Si tu EventService aún es necesario para otros componentes

        return { success: true, message: response.data.message };
      }

      return { success: false, message: 'Error al iniciar sesión' };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Credenciales incorrectas' 
      };
    }
  }

  async register(name: string, email: string, password: string, password_confirmation: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.API_URL}/register`, {
        name,
        email,
        password,
        password_confirmation
      });

      // Opcional: Si quieres que el registro también dispare una notificación
      // (aunque normalmente no se inicia sesión automáticamente tras registrarse)
      // this.userChangedSubject.next(response.data.user);

      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrar usuario' 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${this.API_URL}/logout`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // Aún así, limpiar la sesión localmente
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUser = null;

      // ✅ Emitir evento de cambio de autenticación (ahora también a través del Subject)
      this.userChangedSubject.next(null);
      this.eventService.publishAuthChange(false); // ← Si tu EventService aún es necesario para otros componentes

      this.router.navigateByUrl('/inicio');
    }
  }

  // ✅ Método más explícito para verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // ✅ Método para verificar si hay un token válido en localStorage
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; // Devuelve true si hay un token, false si no
  }

  // ✅ Método para obtener el usuario actual
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ✅ Método para obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Método para verificar si es admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}