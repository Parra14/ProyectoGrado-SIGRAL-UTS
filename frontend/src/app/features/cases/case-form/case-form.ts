import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { CaseService } from '../case.service';
import { NgFor } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
    NgFor
  ],
  template: `
  <mat-card>
    <h2>Registro de Caso</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">

      <!-- ========================= -->
      <!-- 1️⃣ DATOS DEL EVENTO -->
      <!-- ========================= -->

      <h3>Datos del Evento</h3>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Fecha del Evento</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="eventDate">
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Jornada</mat-label>
        <mat-select formControlName="jornada">
          <mat-option value="DIURNA">Diurna</mat-option>
          <mat-option value="NOCTURNA">Nocturna</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Tipo Evento</mat-label>
        <mat-select formControlName="tipoEventoPrincipal">
          <mat-option value="ACCIDENTE">Accidente</mat-option>
          <mat-option value="INCIDENTE">Incidente</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Grado Gravedad</mat-label>
        <mat-select formControlName="gradoGravedad">
          <mat-option value="LEVE">Leve</mat-option>
          <mat-option value="MODERADO">Moderado</mat-option>
          <mat-option value="GRAVE">Grave</mat-option>
          <mat-option value="MORTAL">Mortal</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Categoría del Evento</mat-label>
        <mat-select formControlName="categoriaEvento">
          <mat-option *ngFor="let cat of categoriasEvento" [value]="cat">
            {{ cat }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Lugar Exacto</mat-label>
        <input matInput formControlName="lugarExacto">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Descripción del Evento</mat-label>
        <textarea matInput rows="4" formControlName="descripcionEvento"></textarea>
      </mat-form-field>

      <!-- ========================= -->
      <!-- 2️⃣ DATOS DEL TRABAJADOR -->
      <!-- ========================= -->

      <h3>Datos del Trabajador</h3>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Nombre Completo</mat-label>
        <input matInput formControlName="employeeName">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Identificación</mat-label>
        <input matInput formControlName="employeeId">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Fecha Nacimiento</mat-label>
        <input matInput [matDatepicker]="picker2" formControlName="birthDate">
        <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
        <mat-datepicker #picker2></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Tipo Vinculación</mat-label>
        <mat-select formControlName="tipoVinculacion">
          <mat-option value="DIRECTO">Directo</mat-option>
          <mat-option value="TEMPORAL">Temporal</mat-option>
          <mat-option value="CONTRATISTA">Contratista</mat-option>
          <mat-option value="APRENDIZ">Aprendiz</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Jefe Inmediato</mat-label>
        <input matInput formControlName="jefeInmediato">
      </mat-form-field>

      <!-- ========================= -->
      <!-- 3️⃣ CLASIFICACIÓN -->
      <!-- ========================= -->

      <h3>Clasificación del Evento</h3>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Tipo Lesión</mat-label>
        <mat-select formControlName="tipoLesion" multiple>
          <mat-option *ngFor="let lesion of lesiones" [value]="lesion">
            {{ lesion }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Parte Cuerpo Afectada</mat-label>
        <mat-select formControlName="parteCuerpoAfectada" multiple>
          <mat-option *ngFor="let parte of partesCuerpo" [value]="parte">
            {{ parte }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Agente del Accidente</mat-label>
        <mat-select formControlName="agenteAccidente">
          <mat-option *ngFor="let agente of agentes" [value]="agente">
            {{ agente }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Mecanismo</mat-label>
        <mat-select formControlName="mecanismoAccidente">
          <mat-option *ngFor="let mec of mecanismos" [value]="mec">
            {{ mec }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Regla Salva Vida</mat-label>
        <mat-select formControlName="reglaSalvaVida">
          <mat-option *ngFor="let regla of reglas" [value]="regla">
            {{ regla }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
        {{ isEditMode ? 'Actualizar Caso' : 'Guardar Caso' }}
      </button>

    </form>
  </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 900px;
      margin: auto;
      padding: 25px;
    }

    .full {
      width: 100%;
      margin-bottom: 15px;
    }

    h3 {
      margin-top: 30px;
    }
  `]
})
export class CaseFormComponent implements OnInit {

  form!: FormGroup;

  lesiones = ['FRACTURA','LUXACION','ESGUINCE','CONMOCION','AMPUTACION','GOLPE','QUEMADURA','INTOXICACION'];
  partesCuerpo = ['CABEZA','OJO','CUELLO','TRONCO','MANO','PIE','MIEMBRO_SUPERIOR','MIEMBRO_INFERIOR'];
  agentes = ['MAQUINA','TRANSPORTE','HERRAMIENTA','SUSTANCIA','AMBIENTE','ANIMAL','OTRO'];
  mecanismos = ['CAIDA_PERSONA','CAIDA_OBJETO','GOLPE','ATRAPAMIENTO','SOBREESFUERZO','ELECTRICIDAD','SUSTANCIA'];
  reglas = ['LINEA_PELIGRO','TRABAJO_ALTURAS','CONDUCCION_SEGURA','AISLAMIENTO_ENERGIA'];
  categoriasEvento = ['VIOLENCIA','TRANSITO','DEPORTIVO','RECREATIVO','PROPIO_TRABAJO'];
  constructor(
    private fb: FormBuilder,
    private caseService: CaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  isEditMode = false;
  caseId!: string;

  ngOnInit(): void {

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

    this.caseId = this.route.snapshot.paramMap.get('id')!;

    if (this.caseId) {
      this.isEditMode = true;

      this.caseService.getCaseById(this.caseId)
        .subscribe(caseData => {

          this.form.patchValue({
            ...caseData,
            eventDate: new Date(caseData.eventDate),
            birthDate: new Date(caseData.birthDate)
          });

        });
    }
  }

  submit() {

    if (this.form.invalid) return;

    if (this.isEditMode) {
      this.caseService.updateCase(this.caseId, this.form.value)
        .subscribe(() => {
          this.router.navigate(['/cases']);
        });
    } else {
      this.caseService.createCase(this.form.value)
        .subscribe(() => {
          this.router.navigate(['/cases']);
        });
    }

  }
}