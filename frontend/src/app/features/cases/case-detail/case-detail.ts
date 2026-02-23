import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CaseService } from '../case.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NgFor,
    NgIf
  ],
  template: `
    <h2 mat-dialog-title>Detalle del Caso</h2>

    <mat-dialog-content>

      <p><strong>Código:</strong> {{ data.code }}</p>
      <p><strong>Trabajador:</strong> {{ data.employeeName }}</p>
      <p><strong>Tipo:</strong> {{ data.tipoEventoPrincipal }}</p>
      <p><strong>Estado:</strong> {{ data.status }}</p>

      <h3>Evidencias</h3>

      <div *ngIf="data.evidences?.length; else noEvidences">
        <div *ngFor="let ev of data.evidences">
          <a [href]="'http://localhost:4000' + ev" target="_blank">
            {{ ev.split('/').pop() }}
          </a>
        </div>
      </div>

      <ng-template #noEvidences>
        <p>No hay evidencias cargadas.</p>
      </ng-template>

      <button mat-raised-button color="accent" (click)="fileInput.click()">
        Seleccionar Evidencia
      </button>

      <input
        #fileInput
        type="file"
        hidden
        (change)="onFileSelected($event)"
      />

      <button
        mat-raised-button
        color="primary"
        (click)="uploadSelectedFile()"
        [disabled]="!selectedFile"
      >
        Subir Evidencia
      </button>

      <h3>Comentarios</h3>

      <div *ngIf="data.comments?.length; else noComments">
        <div *ngFor="let c of data.comments">
          <p>
            • {{ c.message }}
            <small>({{ c.createdAt | date:'short' }})</small>
          </p>
        </div>
      </div>

      <ng-template #noComments>
        <p>No hay comentarios.</p>
      </ng-template>

      <form [formGroup]="form" (ngSubmit)="addComment()">

        <mat-form-field appearance="outline" class="full">
          <mat-label>Nuevo Comentario</mat-label>
          <textarea matInput formControlName="message"></textarea>
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          Agregar Comentario
        </button>

      </form>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class CaseDetailComponent {

  form: any;
  selectedFile!: File | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private caseService: CaseService,
    private notification: NotificationService,
    private cd: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      message: ['', Validators.required]
    });
  }

  addComment() {
    if (this.form.invalid) return;

    this.caseService.addComment(this.data._id, this.form.value.message!, )
      .subscribe(() => {

        this.caseService.getCaseById(this.data._id)
          .subscribe(updatedCase => {
            this.data.comments = updatedCase.comments;
            this.notification.success('Comentario agregado correctamente');
            this.form.reset();
          });

      });

      
      
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
  }

  uploadSelectedFile() {

    if (!this.selectedFile) return;

    this.caseService.uploadEvidence(this.data._id, this.selectedFile)
      .subscribe(() => {

        this.notification.success('Evidencia subida correctamente');

        this.caseService.getCaseById(this.data._id)
          .subscribe(updatedCase => {

            this.data = { ...updatedCase }; // 🔥 nueva referencia completa

            this.selectedFile = null;

            this.cd.detectChanges(); // 🔥 fuerza actualización inmediata
          });

      });
  }

}