import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // 👈 Agregado
import { MatDividerModule } from '@angular/material/divider'; // 👈 Agregado
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CaseService } from '../cases/case.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    BaseChartDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,        // 👈 Para los íconos
    MatDividerModule,     // 👈 Para los divisores
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  filterForm!: FormGroup;
  metrics: any;

  public chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#424242',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(46, 125, 50, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  lineChartData: any = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Accidentes',
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
        fill: true
      },
      { 
        data: [], 
        label: 'Incidentes',
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  barChartData: any = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Casos',
        backgroundColor: '#2e7d32',
        borderRadius: 6
      }
    ]
  };

  doughnutChartData: any = {
    labels: [],
    datasets: [
      { 
        data: [],
        backgroundColor: [
          '#2e7d32',
          '#4caf50',
          '#81c784',
          '#ff9800',
          '#f44336'
        ],
        borderWidth: 0
      }
    ]
  };

  constructor(
    private caseService: CaseService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    this.filterForm = this.fb.group({
      from: [last30Days],
      to: [today]
    });

    this.loadMetrics({
      from: last30Days,
      to: today
    });
  }

  loadMetrics(params: any = {}) {
    this.caseService.getDashboardMetrics(params)
      .subscribe(res => {
        this.metrics = res;

        // DONUT
        this.doughnutChartData = {
          labels: res.byType.map((x: any) => x._id),
          datasets: [{ 
            data: res.byType.map((x: any) => x.count),
            backgroundColor: [
              '#2e7d32',
              '#4caf50',
              '#81c784',
              '#ff9800',
              '#f44336'
            ],
            borderWidth: 0
          }]
        };

        // BARRAS
        this.barChartData = {
          labels: res.byGravedad.map((x: any) => x._id),
          datasets: [{ 
            data: res.byGravedad.map((x: any) => x.count), 
            label: 'Casos',
            backgroundColor: '#2e7d32',
            borderRadius: 6
          }]
        };

        // LÍNEA
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

        const dates: string[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }

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
            { 
              data: accidentes, 
              label: 'Accidentes',
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              tension: 0.4,
              fill: true
            },
            { 
              data: incidentes, 
              label: 'Incidentes',
              borderColor: '#ff9800',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        };

        this.cd.detectChanges();
      });

      this.cd.detectChanges();
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
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    this.filterForm.patchValue({
      from: last30Days,
      to: today
    });

    this.loadMetrics({
      from: last30Days,
      to: today
    });
  }
}