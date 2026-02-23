import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    NgIf
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav #sidenav mode="over" class="sidenav">

        <h3 class="menu-title">SIGRAL-UTS</h3>

        <button mat-button routerLink="/dashboard">
          Dashboard
        </button>

        <button mat-button routerLink="/cases">
          Casos
        </button>

        <button *ngIf="role !== 'supervisor'" mat-button routerLink="/reports">
          Reportes
        </button>

        <button *ngIf="role === 'admin'" mat-button>
          Usuarios
        </button>

        <button *ngIf="role === 'admin'" mat-button>
          Categorías
        </button>

        <button mat-button (click)="logout()">
          Cerrar sesión
        </button>

      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="title">Sistema Integral de Gestión de Riesgos</span>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
    }

    .sidenav {
      width: 220px;
      padding: 15px;
    }

    .menu-title {
      margin-bottom: 20px;
      font-weight: bold;
      color: #929292;
    }

    .content {
      padding: 20px;
    }

    .title {
      margin-left: 10px;
    }
  `]
})
export class LayoutComponent {

  role: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.role = this.authService.getUserRole();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
