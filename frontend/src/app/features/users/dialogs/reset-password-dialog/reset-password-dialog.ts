import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Resetear Contraseña</h2>

    <form [formGroup]="form" mat-dialog-content>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nueva contraseña</mat-label>
        <input matInput type="password" formControlName="password">
        <mat-error *ngIf="form.get('password')?.hasError('minlength')">
          Mínimo 6 caracteres
        </mat-error>
      </mat-form-field>

    </form>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button
              color="primary"
              [disabled]="form.invalid || loading"
              (click)="reset()">
        {{ loading ? 'Actualizando...' : 'Actualizar' }}
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
export class ResetPasswordDialogComponent {

  loading = false;
  form: any;
  

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  reset() {
    if (this.form.invalid) return;

    this.loading = true;

    this.userService.resetPassword(this.data._id, this.form.value.password!)
      .subscribe({
        next: () => {
          this.snackBar.open('Contraseña actualizada', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error actualizando contraseña', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }
}