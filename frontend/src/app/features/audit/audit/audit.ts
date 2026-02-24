import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
  ],
  template: `
    <h2>Auditoría del Sistema</h2>

    <!-- FILTROS -->
    <form [formGroup]="filterForm" class="filters">

      <mat-form-field appearance="outline">
        <mat-label>Usuario (nombre o email)</mat-label>
        <input matInput formControlName="user">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Acción</mat-label>
        <input matInput formControlName="action">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Entidad</mat-label>
        <input matInput formControlName="entity">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Desde</mat-label>
        <input matInput [matDatepicker]="picker1" formControlName="from">
        <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
        <mat-datepicker #picker1></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Hasta</mat-label>
        <input matInput [matDatepicker]="picker2" formControlName="to">
        <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
        <mat-datepicker #picker2></mat-datepicker>
      </mat-form-field>

      <button mat-raised-button color="primary" type="button" (click)="applyFilter()">
        Filtrar
      </button>

      <button mat-button type="button" (click)="clearFilter()">
        Limpiar
      </button>

      <button mat-raised-button color="accent" type="button" (click)="exportCSV()">
        <mat-icon>download</mat-icon>
        Exportar CSV
      </button>

    </form>

    <!-- TABLA -->
    <table mat-table [dataSource]="data" class="mat-elevation-z8">

      <ng-container matColumnDef="date">
        <th mat-header-cell *matHeaderCellDef> Fecha </th>
        <td mat-cell *matCellDef="let row">
          {{ row.createdAt | date:'short' }}
        </td>
      </ng-container>

      <ng-container matColumnDef="userId">
        <th mat-header-cell *matHeaderCellDef> Usuario </th>
        <td mat-cell *matCellDef="let row"> {{ row.userId }} </td>
      </ng-container>

      <ng-container matColumnDef="action">
        <th mat-header-cell *matHeaderCellDef> Acción </th>
        <td mat-cell *matCellDef="let row"> {{ row.action }} </td>
      </ng-container>

      <ng-container matColumnDef="entity">
        <th mat-header-cell *matHeaderCellDef> Entidad </th>
        <td mat-cell *matCellDef="let row"> {{ row.entity }} </td>
      </ng-container>

      <ng-container matColumnDef="entityId">
        <th mat-header-cell *matHeaderCellDef> ID Entidad </th>
        <td mat-cell *matCellDef="let row"> {{ row.entityId }} </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns;"></tr>
    </table>

    <mat-paginator
      [length]="total"
      [pageSize]="limit"
      (page)="onPageChange($event)">
    </mat-paginator>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 25px;
      align-items: center;
    }

    table {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class AuditComponent implements OnInit {

  columns = ['date', 'userId', 'action', 'entity', 'entityId'];
  data: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  filterForm: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  

  constructor(
    private auditService: AuditService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
      this.filterForm = this.fb.group({
        user: [''],
        action: [''],
        entity: [''],
        from: [''],
        to: ['']
      });
  }

  ngOnInit(): void {
    this.loadAudit();
  }

  loadAudit() {
    const params = {
      ...this.filterForm.value,
      page: this.page,
      limit: this.limit
    };

    this.auditService.getAuditLogs(params)
      .subscribe(res => {
        this.data = res.logs;
        this.total = res.total;

        this.cd.detectChanges(); // 🔥 esto arregla el NG0100
      });
  }

  applyFilter() {
    this.page = 1;
    this.loadAudit();
  }

  clearFilter() {
    this.filterForm.reset();
    this.page = 1;
    this.loadAudit();
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadAudit();
  }

  exportCSV() {
    const params = { ...this.filterForm.value };

    this.auditService.exportCSV(params)
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit_logs.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}