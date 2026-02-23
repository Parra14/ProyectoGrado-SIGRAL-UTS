import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CaseService } from './case.service';
import { NgIf } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CaseDetailComponent } from './case-detail/case-detail';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    NgIf
  ],
  template: `

   <button mat-raised-button color="primary" routerLink="/cases/create">
      Crear Caso
    </button>

    <h2>Gestión de Casos</h2>


    <!-- FILTROS -->
    <div class="filters">

      <mat-form-field appearance="outline">
        <mat-label>Tipo</mat-label>
        <mat-select [(ngModel)]="filters.tipo">
          <mat-option value="">Todos</mat-option>
          <mat-option value="ACCIDENTE">Accidente</mat-option>
          <mat-option value="INCIDENTE">Incidente</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Estado</mat-label>
        <mat-select [(ngModel)]="filters.estado">
          <mat-option value="">Todos</mat-option>
          <mat-option value="ABIERTO">Abierto</mat-option>
          <mat-option value="CERRADO">Cerrado</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button color="primary" (click)="loadCases(true)">
        Buscar
      </button>

    </div>

    <!-- TABLA -->
    <table mat-table [dataSource]="data" class="mat-elevation-z8">

      <ng-container matColumnDef="code">
        <th mat-header-cell *matHeaderCellDef>Código</th>
        <td mat-cell *matCellDef="let element">{{ element.code }}</td>
      </ng-container>

      <ng-container matColumnDef="employeeName">
        <th mat-header-cell *matHeaderCellDef>Trabajador</th>
        <td mat-cell *matCellDef="let element">{{ element.employeeName }}</td>
      </ng-container>

      <ng-container matColumnDef="tipoEventoPrincipal">
        <th mat-header-cell *matHeaderCellDef>Tipo</th>
        <td mat-cell *matCellDef="let element">{{ element.tipoEventoPrincipal }}</td>
      </ng-container>

      <ng-container matColumnDef="gradoGravedad">
        <th mat-header-cell *matHeaderCellDef>Gravedad</th>
        <td mat-cell *matCellDef="let element">{{ element.gradoGravedad }}</td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let element">{{ element.status }}</td>
      </ng-container>

      <ng-container matColumnDef="seguimiento">
        <th mat-header-cell *matHeaderCellDef>Seguimiento</th>
        <td mat-cell *matCellDef="let element">

          <mat-icon *ngIf="element.comments?.length" color="primary">
            chat
          </mat-icon>

          <mat-icon *ngIf="element.evidences?.length" color="accent">
            attach_file
          </mat-icon>

        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let element">

          <button mat-icon-button color="primary" (click)="viewCase(element)">
            <mat-icon>visibility</mat-icon>
          </button>

          <button mat-icon-button color="accent" (click)="editCase(element)">
            <mat-icon>edit</mat-icon>
          </button>

          <button mat-icon-button color="warn"
            *ngIf="element.status === 'ABIERTO'"
            (click)="closeCase(element)">
            <mat-icon>lock</mat-icon>
          </button>

        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

    </table>

    <mat-paginator
      [length]="total"
      [pageSize]="limit"
      [pageSizeOptions]="[5,10,20]"
      (page)="onPageChange($event)">
    </mat-paginator>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      align-items: center;
    }

    table {
      width: 100%;
      margin-bottom: 20px;
    }
  `]
})
export class CasesComponent implements OnInit {

  displayedColumns: string[] = [
    'code',
    'employeeName',
    'tipoEventoPrincipal',
    'gradoGravedad',
    'status',
    'seguimiento',
    'actions'
  ];

  data: any[] = [];
  total = 0;
  page = 1;
  limit = 10;

  filters: any = {
    tipo: '',
    estado: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private caseService: CaseService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(resetPage = false) {

    if (resetPage) {
      this.page = 1;
      if (this.paginator) {
        this.paginator.firstPage();
      }
    }

    const params: any = {
      page: this.page,
      limit: this.limit
    };

    if (this.filters.tipo) params.tipo = this.filters.tipo;
    if (this.filters.estado) params.estado = this.filters.estado;

    this.caseService.getCases(params)
      .subscribe(res => {
        this.data = res.data;
        this.total = res.total;
        this.cd.detectChanges();
      });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadCases();
  }

  viewCase(element: any) {
    const dialogRef = this.dialog.open(CaseDetailComponent, {
      data: { ...element } // 🔥 copia superficial
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadCases(); // 🔥 recarga tabla
    });
  }

  editCase(element: any) {
    this.router.navigate(['/cases/edit', element._id]);
  }

  closeCase(element: any) {
    if (!confirm('¿Desea cerrar este caso?')) return;

    this.caseService.closeCase(element._id)
      .subscribe(() => {
        this.loadCases();
      });
}

}