import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // 👈 Agregado
import { MatDatepickerModule } from '@angular/material/datepicker'; // 👈 Agregado
import { MatNativeDateModule } from '@angular/material/core'; // 👈 Agregado
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // 👈 Agregado
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
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form-dialog.html',
  styleUrls: ['./user-form-dialog.scss']
})
export class UserFormDialogComponent implements OnInit {
  
  loading = false;
  hidePassword = true;
  form: FormGroup;

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
      password: ['', this.data ? [] : [Validators.required, Validators.minLength(6)]],
      expiresAt: [null]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  getPasswordStrength(): number {
    const password = this.form.get('password')?.value || '';
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    
    return strength;
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 0) return '';
    if (strength <= 25) return 'Débil';
    if (strength <= 50) return 'Media';
    if (strength <= 75) return 'Buena';
    return 'Fuerte';
  }

  save(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const request = this.data
      ? this.userService.updateUser(this.data._id, this.form.value)
      : this.userService.createUser(this.form.value);

    request.subscribe({
      next: () => {
        this.snackBar.open('Usuario guardado correctamente', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error guardando usuario', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }
}