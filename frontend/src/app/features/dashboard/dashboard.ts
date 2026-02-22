import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgFor } from '@angular/common';
import { CaseService } from '../cases/case.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, NgFor],
  template: `
    <h2>Dashboard</h2>

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

    <h3>Casos por Tipo</h3>
    <div *ngFor="let item of metrics?.byType">
      {{ item._id }}: {{ item.count }}
    </div>
  `,
  styles: [`
    .cards {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      flex: 1;
      text-align: center;
    }

    h3 {
      margin-bottom: 10px;
    }
  `]
})
export class DashboardComponent implements OnInit {

  metrics: any;

  constructor(private caseService: CaseService) {}

  ngOnInit(): void {
    this.caseService.getDashboardMetrics()
      .subscribe(data => {
        this.metrics = data;
      });
  }
}