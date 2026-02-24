import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/auth-guard';
import { roleGuard } from './core/role-guard';

export const routes: Routes = [

  // 🔐 Login fuera del layout
  { path: 'login', component: LoginComponent },

  // 🏗 Todo lo autenticado dentro del layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [

      { 
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },

      { 
        path: 'cases',
        loadComponent: () =>
          import('./features/cases/cases')
            .then(m => m.CasesComponent)
      },

      { 
        path: 'cases/create',
        loadComponent: () =>
          import('./features/cases/case-form/case-form')
            .then(m => m.CaseFormComponent)
      },

      { 
        path: 'cases/edit/:id',
        loadComponent: () =>
          import('./features/cases/case-form/case-form')
            .then(m => m.CaseFormComponent)
      },

      { 
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports')
            .then(m => m.Reports)
      },

      // 👤 Users ahora dentro del layout
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () =>
          import('./features/users/users')
            .then(m => m.UsersComponent)
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 🔁 Fallback opcional
  { path: '**', redirectTo: 'dashboard' }

];