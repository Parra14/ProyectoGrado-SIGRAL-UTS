import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon'; // 👈 Agregado
import { MatDividerModule } from '@angular/material/divider'; // 👈 Agregado
import { Router } from '@angular/router';
import { CaseService } from '../case.service';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,        // 👈 Para íconos
    MatDividerModule,     // 👈 Para divisores
    NgFor,
    NgIf                 // 👈 Para mostrar/ocultar secciones
  ],
  templateUrl: './case-form.html',
  styleUrls: ['./case-form.scss']
})
export class CaseFormComponent implements OnInit {

  form!: FormGroup;
  currentStep = 1;

  lesiones = ['FRACTURA','LUXACION','ESGUINCE','CONMOCION','AMPUTACION','GOLPE','QUEMADURA','INTOXICACION'];
  partesCuerpo = ['CABEZA','OJO','CUELLO','TRONCO','MANO','PIE','MIEMBRO_SUPERIOR','MIEMBRO_INFERIOR'];
  agentes = ['MAQUINA','TRANSPORTE','HERRAMIENTA','SUSTANCIA','AMBIENTE','ANIMAL','OTRO'];
  mecanismos = ['CAIDA_PERSONA','CAIDA_OBJETO','GOLPE','ATRAPAMIENTO','SOBREESFUERZO','ELECTRICIDAD','SUSTANCIA'];
  reglas = ['LINEA_PELIGRO','TRABAJO_ALTURAS','CONDUCCION_SEGURA','AISLAMIENTO_ENERGIA'];
  categoriasEvento = ['VIOLENCIA','TRANSITO','DEPORTIVO','RECREATIVO','PROPIO_TRABAJO'];
  
  isEditMode = false;
  caseId!: string;

  constructor(
    private fb: FormBuilder,
    private caseService: CaseService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.caseId = this.route.snapshot.paramMap.get('id')!;
    if (this.caseId) {
      this.isEditMode = true;
      this.loadCaseData();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      eventDate: ['', Validators.required],
      jornada: ['', Validators.required],
      tipoEventoPrincipal: ['', Validators.required],
      gradoGravedad: ['', Validators.required],
      categoriaEvento: ['', Validators.required],
      lugarExacto: ['', Validators.required],
      descripcionEvento: ['', Validators.required],
      employeeName: ['', Validators.required],
      employeeId: ['', Validators.required],
      birthDate: ['', Validators.required],
      tipoVinculacion: ['', Validators.required],
      jefeInmediato: ['', Validators.required],
      tipoLesion: [[], Validators.required],
      parteCuerpoAfectada: [[], Validators.required],
      agenteAccidente: ['', Validators.required],
      mecanismoAccidente: ['', Validators.required],
      reglaSalvaVida: ['', Validators.required]
    });
  }

  loadCaseData(): void {
    this.caseService.getCaseById(this.caseId)
      .subscribe(caseData => {
        this.form.patchValue({
          ...caseData,
          eventDate: new Date(caseData.eventDate),
          birthDate: new Date(caseData.birthDate)
        });
      });
  }

  nextStep(): void {
    if (this.isStepValid() && this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(): boolean {
    switch(this.currentStep) {
      case 1:
        const step1Fields = ['eventDate', 'jornada', 'tipoEventoPrincipal', 'gradoGravedad', 
                             'categoriaEvento', 'lugarExacto', 'descripcionEvento'];
        return step1Fields.every(field => this.form.get(field)?.valid);
      
      case 2:
        const step2Fields = ['employeeName', 'employeeId', 'birthDate', 'tipoVinculacion', 'jefeInmediato'];
        return step2Fields.every(field => this.form.get(field)?.valid);
      
      default:
        return true;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.notification.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.isEditMode) {
      this.caseService.updateCase(this.caseId, this.form.value)
        .subscribe({
          next: () => {
            this.notification.success('Caso actualizado correctamente');
            this.router.navigate(['/cases']);
          },
          error: () => {
            this.notification.error('Error actualizando el caso');
          }
        });
    } else {
      this.caseService.createCase(this.form.value)
        .subscribe({
          next: () => {
            this.notification.success('Caso creado correctamente');
            this.router.navigate(['/cases']);
          },
          error: () => {
            this.notification.error('Error creando el caso');
          }
        });
    }
  }
}