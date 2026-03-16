import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    NgFor,
    NgIf,
    DatePipe
  ],
  template: `
  <h2 mat-dialog-title>Detalle del Caso</h2>

  <mat-dialog-content class="content">

  <!-- DATOS GENERALES -->
  <h3>Información del Caso</h3>

  <div class="grid">

  <p><strong>Código:</strong> {{ data.code }}</p>
  <p><strong>Estado:</strong> {{ data.status }}</p>
  <p><strong>Tipo:</strong> {{ data.tipoEventoPrincipal }}</p>
  <p><strong>Gravedad:</strong> {{ data.gradoGravedad }}</p>

  <p><strong>Trabajador:</strong> {{ data.employeeName }}</p>
  <p><strong>Documento:</strong> {{ data.employeeId }}</p>
  <p><strong>Jefe Inmediato:</strong> {{ data.jefeInmediato }}</p>

  <p><strong>Jornada:</strong> {{ data.jornada }}</p>
  <p><strong>Lugar:</strong> {{ data.lugarExacto }}</p>
  <p><strong>Categoría:</strong> {{ data.categoriaEvento }}</p>

  </div>

  <h3>Descripción del Evento</h3>

  <p class="description">
  {{ data.descripcionEvento }}
  </p>

  <!-- SEGUIMIENTO -->
  <h3>Historial de Seguimiento</h3>

  <div *ngIf="data.seguimientos?.length; else noSeguimientos">

  <div *ngFor="let s of data.seguimientos"
     class="timeline-item"
     [ngClass]="getTimelineClass(s.type)">
     
  <div class="timeline-header">
  

  <strong>{{ getTypeLabel(s.type) }}</strong>

  <span>
  {{ s.createdAt | date:'short' }}
  </span>

  </div>

  <p class="message">
  {{ s.message }}
  </p>

  <!-- CAMBIO DE ESTADO -->
  <div *ngIf="s.type === 'STATUS_CHANGE'" class="status-change">

  Estado:
  <strong>{{ s.fromStatus }}</strong>
  →
  <strong>{{ s.toStatus }}</strong>

  </div>

  <!-- EVIDENCIAS -->
  <div *ngIf="s.evidences?.length" class="evidences">

  <div *ngFor="let ev of s.evidences">

  📎
  <a
  [href]="'http://localhost:4000' + ev"
  target="_blank">

  {{ ev.split('/').pop() }}

  </a>

  </div>

  </div>

  </div>

  </div>

  <ng-template #noSeguimientos>
  <p>No hay seguimiento registrado.</p>
  </ng-template>

  </mat-dialog-content>

  <mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cerrar</button>
  </mat-dialog-actions>
  `,
  styles: [`

  .content{
    max-height:70vh;
    overflow:auto;
  }

  .grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:10px;
    margin-bottom:20px;
  }

  .description{
    background:#f5f5f5;
    padding:10px;
    border-radius:6px;
  }

  .timeline-item{
    padding-left:10px;
    margin-bottom:15px;
    border-left:4px solid #ccc;
  }

  .timeline-system{
    border-left-color:#9e9e9e;
  }

  .timeline-comment{
    border-left-color:#1976d2;
  }

  .timeline-status{
    border-left-color:#2e7d32;
  }

  .timeline-header{
    display:flex;
    justify-content:space-between;
    font-size:13px;
  }

  .message{
    margin:5px 0;
  }

  .status-change{
    font-size:13px;
    color:#555;
  }

  .evidences{
    margin-top:5px;
  }

  a{
    text-decoration:none;
  }

  `]
})
export class CaseDetailComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  getTypeLabel(type: string){

    const map: any = {
      SYSTEM: 'Sistema',
      COMMENT: 'Seguimiento',
      STATUS_CHANGE: 'Cambio de Estado'
    };

    return map[type] || type;
  }

  getTimelineClass(type: string) {

    const map: any = {
      SYSTEM: 'timeline-system',
      COMMENT: 'timeline-comment',
      STATUS_CHANGE: 'timeline-status'
    };

    return map[type] || 'timeline-default';

  }

}