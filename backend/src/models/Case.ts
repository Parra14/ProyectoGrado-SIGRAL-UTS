import mongoose, { Schema, Document } from 'mongoose';

/* =====================================================
   ENUMS
===================================================== */

export type Jornada = 'DIURNA' | 'NOCTURNA';

export type TipoEventoPrincipal =
  | 'ACCIDENTE'
  | 'INCIDENTE';

export type GradoGravedad =
  | 'LEVE'
  | 'MODERADO'
  | 'GRAVE'
  | 'MORTAL';

export type TipoVinculacion =
  | 'DIRECTO'
  | 'TEMPORAL'
  | 'CONTRATISTA'
  | 'VISITANTE'
  | 'APRENDIZ';

/* =====================================================
   NUEVOS ESTADOS DEL FLUJO
===================================================== */

export type EstadoCaso =
  | 'REPORTAR_ARL'
  | 'INVESTIGACION'
  | 'PLAN_ACCION'
  | 'CERRADO';

/* =====================================================
   TIPOS DE SEGUIMIENTO
===================================================== */

export type TipoSeguimiento =
  | 'COMMENT'
  | 'STATUS_CHANGE'
  | 'SYSTEM';

/* =====================================================
   INTERFACE SEGUIMIENTO
===================================================== */

interface ISeguimiento {
  userId: string;
  message: string;

  type: TipoSeguimiento;

  fromStatus?: EstadoCaso;
  toStatus?: EstadoCaso;

  evidences?: string[];

  createdAt: Date;
}

/* =====================================================
   INTERFACE CASE
===================================================== */

export interface ICase extends Document {

  code: string;

  /* EVENTO */

  eventDate: Date;
  jornada: Jornada;
  tipoEventoPrincipal: TipoEventoPrincipal;
  gradoGravedad: GradoGravedad;

  /* TRABAJADOR */

  employeeName: string;
  employeeId: string;
  birthDate: Date;
  tipoVinculacion: TipoVinculacion;
  jefeInmediato: string;

  /* DETALLES EVENTO */

  lugarExacto: string;
  tipoLesion: string[];
  parteCuerpoAfectada: string[];
  agenteAccidente: string;
  mecanismoAccidente: string;
  descripcionEvento: string;
  reglaSalvaVida: string;

  /* SISTEMA */

  categoriaEvento: string;

  status: EstadoCaso;

  seguimientos: ISeguimiento[];

  evidences: string[];

  reportedBy: string;

  isDeleted: boolean;
}

/* =====================================================
   SCHEMA SEGUIMIENTO
===================================================== */

const SeguimientoSchema = new Schema<ISeguimiento>(
  {
    userId: { type: String, required: true },

    message: { type: String, required: true },

    type: {
      type: String,
      enum: ['COMMENT', 'STATUS_CHANGE', 'SYSTEM'],
      default: 'COMMENT'
    },

    fromStatus: {
      type: String,
      enum: ['REPORTAR_ARL', 'INVESTIGACION', 'PLAN_ACCION', 'CERRADO']
    },

    toStatus: {
      type: String,
      enum: ['REPORTAR_ARL', 'INVESTIGACION', 'PLAN_ACCION', 'CERRADO']
    },

    evidences: [{ type: String }],

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

/* =====================================================
   CASE SCHEMA
===================================================== */

const CaseSchema: Schema<ICase> = new Schema(
  {
    code: { type: String, unique: true },

    /* EVENTO */

    eventDate: { type: Date, required: true },

    jornada: {
      type: String,
      enum: ['DIURNA', 'NOCTURNA'],
      required: true
    },

    tipoEventoPrincipal: {
      type: String,
      enum: ['ACCIDENTE', 'INCIDENTE'],
      required: true
    },

    gradoGravedad: {
      type: String,
      enum: ['LEVE', 'MODERADO', 'GRAVE', 'MORTAL'],
      required: true
    },

    /* TRABAJADOR */

    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    birthDate: { type: Date, required: true },

    tipoVinculacion: {
      type: String,
      enum: ['DIRECTO', 'TEMPORAL', 'CONTRATISTA', 'VISITANTE', 'APRENDIZ'],
      required: true
    },

    jefeInmediato: { type: String, required: true },

    /* DETALLES EVENTO */

    lugarExacto: { type: String, required: true },

    tipoLesion: [{ type: String, required: true }],

    parteCuerpoAfectada: [{ type: String, required: true }],

    agenteAccidente: { type: String, required: true },

    mecanismoAccidente: { type: String, required: true },

    descripcionEvento: { type: String, required: true },

    reglaSalvaVida: { type: String, required: true },

    /* SISTEMA */

    categoriaEvento: {
      type: String,
      enum: [
        'VIOLENCIA',
        'TRANSITO',
        'DEPORTIVO',
        'RECREATIVO',
        'PROPIO_TRABAJO'
      ],
      required: true
    },

    status: {
      type: String,
      enum: ['REPORTAR_ARL', 'INVESTIGACION', 'PLAN_ACCION', 'CERRADO'],
      default: 'INVESTIGACION'
    },

    /* SEGUIMIENTOS */

    seguimientos: [SeguimientoSchema],

    /* EVIDENCIAS INICIALES DEL CASO */

    evidences: [{ type: String }],

    reportedBy: { type: String, required: true },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<ICase>('Case', CaseSchema);