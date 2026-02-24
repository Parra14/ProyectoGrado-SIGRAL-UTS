import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <h2>Gestión de Usuarios</h2>

    <div class="header">
      <button mat-raised-button color="primary" (click)="createUser()">
        <mat-icon>person_add</mat-icon>
        Nuevo Usuario
      </button>
    </div>

    <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">

      <!-- Nombre -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef> Nombre </th>
        <td mat-cell *matCellDef="let user"> {{ user.name }} </td>
      </ng-container>

      <!-- Email -->
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef> Email </th>
        <td mat-cell *matCellDef="let user"> {{ user.email }} </td>
      </ng-container>

      <!-- Rol -->
      <ng-container matColumnDef="role">
        <th mat-header-cell *matHeaderCellDef> Rol </th>
        <td mat-cell *matCellDef="let user">
          <mat-chip [ngClass]="user.role">
            {{ user.role }}
          </mat-chip>
        </td>
      </ng-container>

      <!-- Estado -->
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef> Estado </th>
        <td mat-cell *matCellDef="let user">
          <mat-chip [color]="user.isActive ? 'primary' : 'warn'" selected>
            {{ user.isActive ? 'Activo' : 'Inactivo' }}
          </mat-chip>
        </td>
      </ng-container>

      <!-- Acciones -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef> Acciones </th>
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
    .header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
    }

    mat-chip.admin {
      background: #673ab7;
      color: white;
    }

    mat-chip.usuario {
      background: #2196f3;
      color: white;
    }

    mat-chip.supervisor {
      background: #ff9800;
      color: white;
    }

    @media (max-width: 768px) {
      table {
        font-size: 12px;
      }
    }
  `]
})
export class UsersComponent implements OnInit {

  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(res => {
      this.dataSource.data = res.users;
      this.dataSource.paginator = this.paginator;
    });
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