import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip'; // 👈 Agregado
import { MatCardModule } from '@angular/material/card'; // 👈 Agregado
import { MatDividerModule } from '@angular/material/divider'; // 👈 Agregado
import { FormsModule } from '@angular/forms';
import { CaseService } from './case.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CaseDetailComponent } from './case-detail/case-detail';
import { RouterModule, Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CaseFollowupComponent } from './case-followup/case-followup';

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
    MatTooltipModule,        // 👈 Para tooltips
    MatCardModule,           // 👈 Para tarjetas
    MatDividerModule,        // 👈 Para divisores
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './cases.html',
  styleUrls: ['./cases.scss']
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

  data = new MatTableDataSource<any>([]);
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
  @ViewChild(MatSort) sort!: MatSort;

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
      let value = this.filters[key];

      if(value instanceof Date){
        const year = value.getFullYear();
        const month = String(value.getMonth()+1).padStart(2,'0');
        const day = String(value.getDate()).padStart(2,'0');
        value = `${year}-${month}-${day}`;
      }

      if(value){
        params[key] = value;
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filters,
      queryParamsHandling: 'merge'
    });

    this.caseService.getCases(params)
    .subscribe(res=>{
      this.data.data = res.data;
      this.total = res.total;
      this.data.sort = this.sort;
      this.cd.detectChanges();
    });
  }

  clearFilters() {
    this.filters = {
      tipo:'',
      estado:'',
      grado:'',
      code:'',
      employee:'',
      keyword:'',
      from:'',
      to:''
    };
    this.loadCases(true);
  }

  onPageChange(event:any){
    this.page=event.pageIndex+1;
    this.limit=event.pageSize;
    this.loadCases();
  }

  getLastUpdate(caseItem:any){
    if(!caseItem.seguimientos?.length) return null;
    const last = caseItem.seguimientos[caseItem.seguimientos.length-1];
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
    const dialogRef = this.dialog.open(
      CaseFollowupComponent,
      {
        width: '600px',
        data: {
          caseId: element._id,
          status: element.status,
          mode: 'seguimiento'
        }
      }
    );
    dialogRef.afterClosed().subscribe(result=>{
      if(result){
        this.loadCases();
      }
    });
  } 

  openStatusModal(element:any){
    const dialogRef = this.dialog.open(
      CaseFollowupComponent,
      {
        width: '600px',
        data: {
          caseId: element._id,
          status: element.status,
          mode: 'status'
        }
      }
    );
    dialogRef.afterClosed().subscribe(result=>{
      if(result){
        this.loadCases();
      }
    });
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