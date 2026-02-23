import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CaseService } from '../cases/case.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    BaseChartDirective
  ],
  template: `
    <h2>Dashboard</h2>

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
        <canvas baseChart
          [data]="lineChartData"
          [type]="'line'">
        </canvas>
      </mat-card>

      <mat-card class="chart">
        <h3>Casos por Gravedad</h3>
        <canvas baseChart
          [data]="barChartData"
          [type]="'bar'">
        </canvas>
      </mat-card>

      <mat-card class="chart">
        <h3>Distribución por Tipo</h3>
        <canvas baseChart
          [data]="doughnutChartData"
          [type]="'doughnut'">
        </canvas>
      </mat-card>

    </div>
  `,
  styles: [`
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
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .chart {
      padding: 20px;
    }

    h3 {
      margin-bottom: 15px;
    }
  `]
})
export class DashboardComponent implements OnInit {

  metrics: any;

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

  constructor(private caseService: CaseService,private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics() {
    this.caseService.getDashboardMetrics()
      .subscribe(res => {

        this.metrics = res;

        // DONUT
        this.doughnutChartData = {
          labels: res.byType.map((x: any) => x._id),
          datasets: [
            { data: res.byType.map((x: any) => x.count) }
          ]
        };

        // BARRAS
        this.barChartData = {
          labels: res.byGravedad.map((x: any) => x._id),
          datasets: [
            { data: res.byGravedad.map((x: any) => x.count), label: 'Casos' }
          ]
        };

        // LINEA
        const dates = [...new Set(res.byDate.map((x: any) => x._id.date))];

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
}