import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'cases', loadComponent: () => import('./features/cases/cases').then(m => m.CasesComponent) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports').then(m => m.Reports) },
      { path: 'cases/create', loadComponent: () => import('./features/cases/case-form/case-form').then(m => m.CaseFormComponent) },
      { path: 'cases/edit/:id', loadComponent: () => import('./features/cases/case-form/case-form').then(m => m.CaseFormComponent)},
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];