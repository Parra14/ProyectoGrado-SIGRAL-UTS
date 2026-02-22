import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    NgFor,
    NgIf
  ],
  template: `
    <h2 mat-dialog-title>Detalle del Caso</h2>

    <mat-dialog-content>

      <p><strong>Código:</strong> {{ data.code }}</p>
      <p><strong>Trabajador:</strong> {{ data.employeeName }}</p>
      <p><strong>Tipo:</strong> {{ data.tipoEventoPrincipal }}</p>
      <p><strong>Gravedad:</strong> {{ data.gradoGravedad }}</p>
      <p><strong>Estado:</strong> {{ data.status }}</p>
      <p><strong>Descripción:</strong> {{ data.descripcionEvento }}</p>

      <h3>Comentarios</h3>
      <div *ngIf="data.comments?.length; else noComments">
        <div *ngFor="let c of data.comments">
          <p>• {{ c.message }}</p>
        </div>
      </div>

      <ng-template #noComments>
        <p>No hay comentarios registrados.</p>
      </ng-template>

      <h3>Evidencias</h3>
      <div *ngIf="data.evidences?.length; else noFiles">
        <div *ngFor="let e of data.evidences">
          <a [href]="'http://localhost:4000' + e" target="_blank">
            Ver archivo
          </a>
        </div>
      </div>

      <ng-template #noFiles>
        <p>No hay evidencias cargadas.</p>
      </ng-template>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class CaseDetailComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}