import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CaseService } from '../cases/case.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    BaseChartDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  template: `
    <h2>Dashboard</h2>

    <!-- FILTROS -->
    <form [formGroup]="filterForm" class="filters">

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
        Aplicar
      </button>

      <button mat-button color="warn" type="button" (click)="clearFilter()">
        Limpiar
      </button>

    </form>

    <!-- CARDS -->
    <div class="cards">
      <mat-card class="card">
        <h3>Total Casos</h3>
        <p>{{ metrics?.totalCases }}</p>
      </mat-card>

      <mat-card class="card">
        <h3>Abiertos</h3>
        <p>{{ metrics?.openCases }}</p>
      </mat-card>

      <mat-card class="card">
        <h3>Cerrados</h3>
        <p>{{ metrics?.closedCases }}</p>
      </mat-card>
    </div>

    <!-- CHARTS -->
    <div class="charts">

      <mat-card class="chart">
        <h3>Accidentes vs Incidentes</h3>
        <div class="chart-container">
        <canvas baseChart
          [data]="lineChartData"
          [options]="chartOptions"
          [type]="'line'">
        </canvas>
        </div>
      </mat-card>

      <mat-card class="chart">
        <h3>Casos por Gravedad</h3>
        <div class="chart-container">
          <canvas baseChart
            [data]="barChartData"
            [options]="chartOptions"
            [type]="'bar'">
          </canvas>
        </div>
      </mat-card>

      <mat-card class="chart">
        <h3>Distribución por Tipo</h3>
        <div class="chart-container">
          <canvas baseChart
            [data]="doughnutChartData"
            [options]="chartOptions"
            [type]="'doughnut'">
          </canvas>
        </div>
      </mat-card>

    </div>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      align-items: center;
    }

    .cards {
      display: flex;
      gap: 20px;
      margin-bottom: 40px;
    }

    .card {
      flex: 1;
      text-align: center;
    }

    .charts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }
      

    .chart {
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .chart-container {
      position: relative;
      width: 100%;
      height: 300px;
    }

    @media (max-width: 768px) {
      .chart-container {
        height: 250px;
      }
    }

    .charts mat-card {
      display: flex;
      flex-direction: column;
    }
      
    h3 {
      margin-bottom: 15px;
    }
  `]
})
export class DashboardComponent implements OnInit {

  filterForm!: FormGroup;
  metrics: any;

  public chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false
  };

  lineChartData: any = {
    labels: [],
    datasets: [
      { data: [], label: 'Accidentes' },
      { data: [], label: 'Incidentes' }
    ]
  };

  barChartData: any = {
    labels: [],
    datasets: [
      { data: [], label: 'Casos' }
    ]
  };

  doughnutChartData: any = {
    labels: [],
    datasets: [
      { data: [] }
    ]
  };

  constructor(
    private caseService: CaseService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      from: [''],
      to: ['']
    });

    this.loadMetrics();
  }

  loadMetrics(params: any = {}) {
    this.caseService.getDashboardMetrics(params)
      .subscribe(res => {

        this.metrics = res;

        // DONUT
        this.doughnutChartData = {
          labels: res.byType.map((x: any) => x._id),
          datasets: [{ data: res.byType.map((x: any) => x.count) }]
        };

        // BARRAS
        this.barChartData = {
          labels: res.byGravedad.map((x: any) => x._id),
          datasets: [{ data: res.byGravedad.map((x: any) => x.count), label: 'Casos' }]
        };

        // LINEA
        // === GENERAR RANGO COMPLETO DE FECHAS ===

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = this.filterForm?.value?.from
          ? new Date(this.filterForm.value.from)
          : new Date(res.byDate[0]?._id.date || today);

        startDate.setHours(0, 0, 0, 0);

        const endDate = this.filterForm?.value?.to
          ? new Date(this.filterForm.value.to)
          : today;

        endDate.setHours(0, 0, 0, 0);

        // Generar arreglo de fechas completas
        const dates: string[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }

        // === CONSTRUIR SERIES ===

        const accidentes: number[] = [];
        const incidentes: number[] = [];

        dates.forEach(date => {
          const acc = res.byDate.find((x: any) =>
            x._id.date === date && x._id.type === 'ACCIDENTE');

          const inc = res.byDate.find((x: any) =>
            x._id.date === date && x._id.type === 'INCIDENTE');

          accidentes.push(acc ? acc.count : 0);
          incidentes.push(inc ? inc.count : 0);
        });

        // === ASIGNAR AL CHART ===

        this.lineChartData = {
          labels: dates,
          datasets: [
            { data: accidentes, label: 'Accidentes' },
            { data: incidentes, label: 'Incidentes' }
          ]
        };

        this.cd.detectChanges();
      });
  }

  applyFilter() {
    const params: any = {};

    if (this.filterForm.value.from)
      params.from = this.filterForm.value.from;

    if (this.filterForm.value.to)
      params.to = this.filterForm.value.to;

    this.loadMetrics(params);
  }

  clearFilter() {
    this.filterForm.reset();
    this.loadMetrics();
  }
}