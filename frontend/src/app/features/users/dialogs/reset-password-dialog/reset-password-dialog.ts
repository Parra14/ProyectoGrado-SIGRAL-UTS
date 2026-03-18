import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // 👈 Agregado
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // 👈 Agregado
import { MatDividerModule } from '@angular/material/divider'; // 👈 Agregado
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
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './reset-password-dialog.html',
  styleUrls: ['./reset-password-dialog.scss']
})
export class ResetPasswordDialogComponent {

  loading = false;
  hidePassword = true;
  form: FormGroup;

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

  getRoleName(role: string): string {
    const roles: any = {
      'admin': 'Administrador',
      'usuario': 'Usuario',
      'supervisor': 'Supervisor'
    };
    return roles[role] || role;
  }

  getPasswordStrength(): number {
    const password = this.form.get('password')?.value || '';
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25; // Caracteres especiales
    
    return Math.min(strength, 100);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 0) return '';
    if (strength <= 25) return 'Débil';
    if (strength <= 50) return 'Media';
    if (strength <= 75) return 'Buena';
    return 'Fuerte';
  }

  getStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 25) return 'strength-weak';
    if (strength <= 50) return 'strength-medium';
    if (strength <= 75) return 'strength-good';
    return 'strength-strong';
  }

  hasMinLength(): boolean {
    const password = this.form.get('password')?.value || '';
    return password.length >= 6;
  }

  reset(): void {
    if (this.form.invalid) return;

    this.loading = true;

    this.userService.resetPassword(this.data._id, this.form.value.password)
      .subscribe({
        next: () => {
          this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error actualizando contraseña', 'Cerrar', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }
}