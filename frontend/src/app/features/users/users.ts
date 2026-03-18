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
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card'; // 👈 Agregado
import { MatDividerModule } from '@angular/material/divider'; // 👈 Agregado
import { MatTooltipModule } from '@angular/material/tooltip'; // 👈 Agregado

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
    MatSelectModule,
    MatCardModule,        // 👈 Para tarjetas
    MatDividerModule,     // 👈 Para divisores
    MatTooltipModule      // 👈 Para tooltips
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {

  displayedColumns: string[] = ['_id', 'name', 'email', 'role', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<any>();

  filterForm: FormGroup;

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

  loadUsers(): void {
    const params = {
      ...this.filterForm.value
    };

    this.userService.getUsers(params).subscribe(res => {
      this.dataSource.data = res.users;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(): void {
    this.loadUsers();
  }

  clearFilter(): void {
    this.filterForm.reset();
    this.loadUsers();
  }

  createUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  editUser(user: any): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: user,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  resetPassword(user: any): void {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '600px',
      data: user,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  toggleStatus(user: any): void {
    const currentUserId = this.authService.getUserId();

    if (user._id === currentUserId) {
      this.snackBar.open('No puedes desactivarte a ti mismo', 'Cerrar', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
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
        this.userService.toggleStatus(user._id).subscribe({
          next: () => {
            this.snackBar.open('Estado actualizado correctamente', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadUsers();
          },
          error: () => {
            this.snackBar.open('Error al actualizar el estado', 'Cerrar', { 
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  getRoleName(role: string): string {
    const roles: any = {
      'admin': 'Administrador',
      'usuario': 'Usuario',
      'supervisor': 'Supervisor'
    };
    return roles[role] || role;
  }
}