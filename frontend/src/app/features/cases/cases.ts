import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CaseService } from './case.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CaseDetailComponent } from './case-detail/case-detail';
import { RouterModule, Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    RouterModule
  ],
  template: `

  <div class="top-bar">

    <button mat-raised-button color="primary" routerLink="/cases/create">
      Crear Caso
    </button>

    <div class="export-buttons">

      <button mat-raised-button color="accent" (click)="exportPDF()">
        Exportar PDF
      </button>

      <button mat-raised-button color="primary" (click)="exportCSV()">
        Exportar CSV
      </button>

    </div>

  </div>

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
        <mat-option value="REPORTAR_ARL">Reportar ARL</mat-option>
        <mat-option value="INVESTIGACION">Investigación</mat-option>
        <mat-option value="PLAN_ACCION">Plan Acción</mat-option>
        <mat-option value="CERRADO">Cerrado</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Gravedad</mat-label>
      <mat-select [(ngModel)]="filters.grado">
        <mat-option value="">Todas</mat-option>
        <mat-option value="LEVE">Leve</mat-option>
        <mat-option value="MODERADO">Moderado</mat-option>
        <mat-option value="GRAVE">Grave</mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Código</mat-label>
      <input matInput [(ngModel)]="filters.code">
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Trabajador</mat-label>
      <input matInput [(ngModel)]="filters.employee">
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Palabra clave</mat-label>
      <input matInput [(ngModel)]="filters.keyword">
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Desde</mat-label>
      <input matInput [matDatepicker]="pickerFrom" [(ngModel)]="filters.from">
      <mat-datepicker-toggle matIconSuffix [for]="pickerFrom"></mat-datepicker-toggle>
      <mat-datepicker #pickerFrom></mat-datepicker>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label>Hasta</mat-label>
      <input matInput [matDatepicker]="pickerTo" [(ngModel)]="filters.to">
      <mat-datepicker-toggle matIconSuffix [for]="pickerTo"></mat-datepicker-toggle>
      <mat-datepicker #pickerTo></mat-datepicker>
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

    <ng-container matColumnDef="lastUpdate">
      <th mat-header-cell *matHeaderCellDef>Última Actualización</th>
      <td mat-cell *matCellDef="let element">
        {{ getLastUpdate(element) | date:'short' }}
      </td>
    </ng-container>

    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Acciones</th>

      <td mat-cell *matCellDef="let element">

        <button mat-icon-button matTooltip="Detalles"
        (click)="viewCase(element)">
          <mat-icon>visibility</mat-icon>
        </button>

        <button mat-icon-button matTooltip="Editar"
        (click)="editCase(element)">
          <mat-icon>edit</mat-icon>
        </button>

        <button mat-icon-button matTooltip="Agregar seguimiento"
        (click)="openSeguimientoModal(element)">
          <mat-icon>chat</mat-icon>
        </button>

        <button mat-icon-button matTooltip="Cambiar estado"
        (click)="openStatusModal(element)"
        [disabled]="element.status === 'CERRADO'">
          <mat-icon>sync</mat-icon>
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

  .top-bar{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:10px;
  }

  .export-buttons{
    display:flex;
    gap:10px;
  }

  .filters{
    display:flex;
    flex-wrap:wrap;
    gap:15px;
    margin-bottom:20px;
  }

  table{
    width:100%;
    margin-bottom:20px;
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
    'lastUpdate',
    'actions'
  ];

  data: any[] = [];
  total = 0;
  page = 1;
  limit = 10;

  filters:any = {
    tipo:'',
    estado:'',
    grado:'',
    code:'',
    employee:'',
    keyword:'',
    from:'',
    to:''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private caseService:CaseService,
    private cd:ChangeDetectorRef,
    private dialog:MatDialog,
    private router:Router,
    private route: ActivatedRoute
  ){}

  ngOnInit(){

    this.route.queryParams.subscribe(params => {

      this.filters = {
        ...this.filters,
        ...params
      };

      this.loadCases();

    });

  }

  loadCases(resetPage=false){

    if(resetPage){
      this.page=1;
      this.paginator?.firstPage();
    }

    const params:any = {
      page:this.page,
      limit:this.limit
    };

    Object.keys(this.filters).forEach(key=>{
      if(this.filters[key]){
        params[key]=this.filters[key];
      }
    });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filters,
      queryParamsHandling: 'merge'
    });
    this.caseService.getCases(params)
    .subscribe(res=>{

      this.data=res.data;
      this.total=res.total;

      this.cd.detectChanges();

    });

  }

  onPageChange(event:any){
    this.page=event.pageIndex+1;
    this.limit=event.pageSize;
    this.loadCases();
  }

  getLastUpdate(caseItem:any){

    if(!caseItem.seguimientos?.length) return null;

    const last = caseItem.seguimientos[
      caseItem.seguimientos.length-1
    ];

    return last.createdAt;

  }

  viewCase(element:any){

    const dialogRef = this.dialog.open(CaseDetailComponent,{
      width:'800px',
      data:{...element}
    });

    dialogRef.afterClosed().subscribe(()=>{
      this.loadCases();
    });

  }

  editCase(element:any){
    this.router.navigate(['/cases/edit',element._id]);
  }

  openSeguimientoModal(element:any){
    console.log("Seguimiento",element);
  }

  openStatusModal(element:any){
    console.log("Cambio estado",element);
  }

  exportCSV(){

    const params:any = {...this.filters};

    this.caseService.exportCSV(params)
    .subscribe(blob=>{

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href=url;
      a.download='reporte_casos.csv';

      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

  exportPDF(){

    const params:any = {...this.filters};

    this.caseService.exportPDF(params)
    .subscribe(blob=>{

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href=url;
      a.download='reporte_casos.pdf';

      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

}