import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

import { UserService } from './user.service';
import { UserFormDialogComponent } from './dialogs/user-form-dialog/user-form-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { AuthService } from '../../core/auth';
import { ResetPasswordDialogComponent } from './dialogs/reset-password-dialog/reset-password-dialog';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  template: `
    <h2>Gestión de Usuarios</h2>

    <!-- FILTROS -->
    <form [formGroup]="filterForm" class="filters">

      <mat-form-field appearance="outline">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="name">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Rol</mat-label>
        <mat-select formControlName="role">
          <mat-option value="">Todos</mat-option>
          <mat-option value="admin">Admin</mat-option>
          <mat-option value="usuario">Usuario</mat-option>
          <mat-option value="supervisor">Supervisor</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Estado</mat-label>
        <mat-select formControlName="isActive">
          <mat-option value="">Todos</mat-option>
          <mat-option value="true">Activo</mat-option>
          <mat-option value="false">Inactivo</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button color="primary" type="button" (click)="applyFilter()">
        Filtrar
      </button>

      <button mat-button type="button" (click)="clearFilter()">
        Limpiar
      </button>

    </form>

    <div class="header">
      <button mat-raised-button color="primary" (click)="createUser()">
        <mat-icon>person_add</mat-icon>
        Nuevo Usuario
      </button>
    </div>

    <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">

      <!-- ID -->
      <ng-container matColumnDef="_id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
        <td mat-cell *matCellDef="let user">{{ user._id }}</td>
      </ng-container>

      <!-- Nombre -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
        <td mat-cell *matCellDef="let user">{{ user.name }}</td>
      </ng-container>

      <!-- Email -->
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
        <td mat-cell *matCellDef="let user">{{ user.email }}</td>
      </ng-container>

      <!-- Rol -->
      <ng-container matColumnDef="role">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Rol</th>
        <td mat-cell *matCellDef="let user">
          <mat-chip [ngClass]="user.role">
            {{ user.role }}
          </mat-chip>
        </td>
      </ng-container>

      <!-- Estado -->
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
        <td mat-cell *matCellDef="let user">
          <mat-chip [color]="user.isActive ? 'primary' : 'warn'" selected>
            {{ user.isActive ? 'Activo' : 'Inactivo' }}
          </mat-chip>
        </td>
      </ng-container>

      <!-- Acciones -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let user">

          <button mat-icon-button color="primary" (click)="editUser(user)">
            <mat-icon>edit</mat-icon>
          </button>

          <button mat-icon-button color="accent" (click)="resetPassword(user)">
            <mat-icon>lock_reset</mat-icon>
          </button>

          <button mat-icon-button color="warn" (click)="toggleStatus(user)">
            <mat-icon>
              {{ user.isActive ? 'block' : 'check_circle' }}
            </mat-icon>
          </button>

        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

    </table>

    <mat-paginator [pageSize]="10"></mat-paginator>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
    }
  `]
})
export class UsersComponent implements OnInit {

  displayedColumns: string[] = ['_id', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();

  filterForm: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      email: [''],
      role: [''],
      isActive: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {

    const params = {
      ...this.filterForm.value
    };

    this.userService.getUsers(params).subscribe(res => {
      this.dataSource.data = res.users;

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter() {
    this.loadUsers();
  }

  clearFilter() {
    this.filterForm.reset();
    this.loadUsers();
  }

  createUser() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  resetPassword(user: any) {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '400px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  toggleStatus(user: any) {

    const currentUserId = this.authService.getUserId();

    if (user._id === currentUserId) {
      this.snackBar.open('No puedes desactivarte a ti mismo', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: user.isActive ? 'Desactivar Usuario' : 'Activar Usuario',
        message: `¿Seguro que deseas ${user.isActive ? 'desactivar' : 'activar'} este usuario?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.toggleStatus(user._id).subscribe(() => {
          this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        });
      }
    });
  }

}