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
  templateUrl: './case-detail.html',
  styleUrls: ['./case-detail.scss']
})
export class CaseDetailComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  getTypeLabel(type: string): string {
    const map: any = {
      SYSTEM: 'Sistema',
      COMMENT: 'Seguimiento',
      STATUS_CHANGE: 'Cambio de Estado'
    };
    return map[type] || type;
  }

  getTimelineClass(type: string): string {
    const map: any = {
      SYSTEM: 'timeline-system',
      COMMENT: 'timeline-comment',
      STATUS_CHANGE: 'timeline-status'
    };
    return map[type] || 'timeline-default';
  }

  getTimelineIcon(type: string): string {
    const map: any = {
      SYSTEM: '⚙️',
      COMMENT: '💬',
      STATUS_CHANGE: '🔄'
    };
    return map[type] || '📌';
  }

  getTimelineIconClass(type: string): string {
    const map: any = {
      SYSTEM: 'icon-system',
      COMMENT: 'icon-comment',
      STATUS_CHANGE: 'icon-status'
    };
    return map[type] || '';
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    return `status-${status}`;
  }

  getSeverityClass(severity: string): string {
    if (!severity) return '';
    return `severity-${severity}`;
  }
}