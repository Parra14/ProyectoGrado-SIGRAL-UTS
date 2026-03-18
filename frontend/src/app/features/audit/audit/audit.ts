import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditService } from '../audit.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './audit.html',
  styleUrls: ['./audit.scss']
})
export class AuditComponent implements OnInit {

  columns = ['date', 'user', 'action', 'entity', 'entityId'];
  data: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  filterForm: FormGroup;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private auditService: AuditService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      globalSearch: [''],
      user: [''],
      action: [''],
      entity: [''],
      registro: [''],
      from: [''],
      to: ['']
    });
  }

  ngOnInit(): void {
    this.loadAudit();
  }

  getActionClass(action: string): string {
    if (action.includes('CREATE')) return 'action-create';
    if (action.includes('UPDATE') || action.includes('CHANGE')) return 'action-update';
    if (action.includes('DELETE')) return 'action-delete';
    if (action.includes('VIEW')) return 'action-view';
    if (action.includes('UPLOAD')) return 'action-upload';
    if (action.includes('DOWNLOAD')) return 'action-download';
    if (action.includes('LOGIN')) return 'action-login';
    if (action.includes('LOGOUT')) return 'action-logout';
    if (action.includes('CLOSE')) return 'action-close';
    return '';
  }

  getActionIcon(action: string): string {
    if (action.includes('CREATE')) return 'add_circle';
    if (action.includes('UPDATE')) return 'edit';
    if (action.includes('DELETE')) return 'delete';
    if (action.includes('VIEW')) return 'visibility';
    if (action.includes('UPLOAD')) return 'cloud_upload';
    if (action.includes('DOWNLOAD')) return 'cloud_download';
    if (action.includes('LOGIN')) return 'login';
    if (action.includes('LOGOUT')) return 'logout';
    if (action.includes('CLOSE')) return 'check_circle';
    return 'circle';
  }

  getPeriodText(): string {
    const from = this.filterForm.get('from')?.value;
    const to = this.filterForm.get('to')?.value;
    
    if (from && to) {
      return `${new Date(from).toLocaleDateString()} - ${new Date(to).toLocaleDateString()}`;
    } else if (from) {
      return `Desde ${new Date(from).toLocaleDateString()}`;
    } else if (to) {
      return `Hasta ${new Date(to).toLocaleDateString()}`;
    }
    return 'Todo el historial';
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.filterForm.value).some(key => 
      this.filterForm.value[key] && this.filterForm.value[key] !== ''
    );
  }

  getActiveFiltersCount(): number {
    return Object.keys(this.filterForm.value).filter(key => 
      this.filterForm.value[key] && this.filterForm.value[key] !== ''
    ).length;
  }

  getActionSummary(): any[] {
    const summary: any = {};
    
    this.data.forEach(item => {
      const actionType = this.getActionClass(item.action).replace('action-', '') || 'other';
      if (!summary[actionType]) {
        summary[actionType] = {
          label: this.getActionLabel(item.action),
          count: 0,
          color: this.getActionColor(actionType)
        };
      }
      summary[actionType].count++;
    });

    return Object.values(summary);
  }

  private getActionLabel(action: string): string {
    if (action.includes('CREATE')) return 'Creaciones';
    if (action.includes('UPDATE')) return 'Actualizaciones';
    if (action.includes('DELETE')) return 'Eliminaciones';
    if (action.includes('VIEW')) return 'Visualizaciones';
    if (action.includes('UPLOAD')) return 'Subidas';
    if (action.includes('DOWNLOAD')) return 'Descargas';
    if (action.includes('LOGIN')) return 'Inicios sesión';
    if (action.includes('LOGOUT')) return 'Cierres sesión';
    if (action.includes('CLOSE')) return 'Cierres';
    return 'Otras';
  }

  private getActionColor(type: string): string {
    const colors: any = {
      'create': '#4caf50',
      'update': '#ff9800',
      'delete': '#f44336',
      'view': '#2196f3',
      'upload': '#9c27b0',
      'download': '#009688',
      'login': '#607d8b',
      'logout': '#795548',
      'close': '#673ab7'
    };
    return colors[type] || '#757575';
  }

  loadAudit(): void {
    const params: any = {
      ...this.filterForm.value,
      page: this.page,
      limit: this.limit
    };

    // Limpiar parámetros vacíos
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    this.auditService.getAuditLogs(params)
      .subscribe(res => {
        this.data = res.logs || [];
        this.total = res.total || 0;
        this.cd.detectChanges();
      });
  }

  applyFilter(): void {
    this.page = 1;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadAudit();
  }

  clearFilter(): void {
    this.filterForm.reset();
    this.page = 1;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadAudit();
  }

  onPageChange(event: any): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadAudit();
  }

  exportCSV(): void {
    const params: any = { ...this.filterForm.value };
    
    // Limpiar parámetros vacíos
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    this.auditService.exportCSV(params)
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}