import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  role: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const decoded = this.decodeToken();
    return decoded?.role || null;
  }

  getUserId(): string | null {
    const decoded = this.decodeToken();
    return decoded?.id || null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
}