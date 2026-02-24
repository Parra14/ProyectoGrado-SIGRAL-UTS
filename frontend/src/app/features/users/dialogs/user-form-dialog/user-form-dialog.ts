import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data ? 'Editar Usuario' : 'Crear Usuario' }}
    </h2>

    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="name">
        <mat-error *ngIf="form.get('name')?.hasError('required')">
          El nombre es obligatorio
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email">
        <mat-error *ngIf="form.get('email')?.hasError('required')">
          El email es obligatorio
        </mat-error>
        <mat-error *ngIf="form.get('email')?.hasError('email')">
          Email inválido
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Rol</mat-label>
        <mat-select formControlName="role">
          <mat-option value="admin">Admin</mat-option>
          <mat-option value="usuario">Usuario</mat-option>
          <mat-option value="supervisor">Supervisor</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="!data" appearance="outline" class="full-width">
        <mat-label>Contraseña</mat-label>
        <input matInput type="password" formControlName="password">
        <mat-error *ngIf="form.get('password')?.hasError('minlength')">
          Mínimo 6 caracteres
        </mat-error>
      </mat-form-field>

      <mat-form-field *ngIf="form.value.role === 'supervisor'" appearance="outline" class="full-width">
        <mat-label>Fecha expiración (opcional)</mat-label>
        <input matInput type="date" formControlName="expiresAt">
      </mat-form-field>

    </form>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button
              color="primary"
              [disabled]="form.invalid || loading"
              (click)="save()">
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class UserFormDialogComponent implements OnInit {
  
  

  loading = false;

  
  form: any;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['usuario', Validators.required],
      password: ['', [Validators.minLength(6)]],
      expiresAt: [null]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
      this.form.get('password')?.clearValidators();
    }
  }

  save() {
    if (this.form.invalid) return;

    this.loading = true;

    const request = this.data
      ? this.userService.updateUser(this.data._id, this.form.value)
      : this.userService.createUser(this.form.value);

    request.subscribe({
      next: () => {
        this.snackBar.open('Usuario guardado correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error guardando usuario', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}