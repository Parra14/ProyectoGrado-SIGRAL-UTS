import mongoose, { Schema, Document } from 'mongoose';

export type Jornada = 'DIURNA' | 'NOCTURNA';
export type TipoEventoPrincipal = 'ACCIDENTE' | 'INCIDENTE';
export type GradoGravedad = 'LEVE' | 'MODERADO' | 'GRAVE' | 'MORTAL';

export type TipoVinculacion =
  | 'DIRECTO'
  | 'TEMPORAL'
  | 'CONTRATISTA'
  | 'VISITANTE'
  | 'APRENDIZ';

export type EstadoCaso = 'ABIERTO' | 'CERRADO';

interface IComment {
  userId: string;
  message: string;
  createdAt: Date;
}

export interface ICase extends Document {
  code: string;

  // Evento
  eventDate: Date;
  jornada: Jornada;
  tipoEventoPrincipal: TipoEventoPrincipal;
  gradoGravedad: GradoGravedad;

  // Trabajador
  employeeName: string;
  employeeId: string;
  birthDate: Date;
  tipoVinculacion: TipoVinculacion;
  jefeInmediato: string;

  // Detalles evento
  lugarExacto: string;
  tipoLesion: string[];
  parteCuerpoAfectada: string[];
  agenteAccidente: string;
  mecanismoAccidente: string;
  descripcionEvento: string;
  reglaSalvaVida: string;

  // Sistema
  categoriaEvento: string;
  status: EstadoCaso;
  comments: IComment[];
  evidences: string[];
  reportedBy: string;

  isDeleted: boolean;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const CaseSchema: Schema<ICase> = new Schema(
  {
    code: { type: String, unique: true },

    eventDate: { type: Date, required: true },
    jornada: { type: String, enum: ['DIURNA', 'NOCTURNA'], required: true },
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

    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    birthDate: { type: Date, required: true },
    tipoVinculacion: {
      type: String,
      enum: ['DIRECTO', 'TEMPORAL', 'CONTRATISTA', 'VISITANTE', 'APRENDIZ'],
      required: true
    },
    jefeInmediato: { type: String, required: true },

    lugarExacto: { type: String, required: true },
    tipoLesion: [{ type: String, required: true }],
    parteCuerpoAfectada: [{ type: String, required: true }],
    agenteAccidente: { type: String, required: true },
    mecanismoAccidente: { type: String, required: true },
    descripcionEvento: { type: String, required: true },
    reglaSalvaVida: { type: String, required: true },

    categoriaEvento: {
      type: String,
      enum: ['VIOLENCIA','TRANSITO','DEPORTIVO','RECREATIVO','PROPIO_TRABAJO'],
      required: true
    },

    status: {
      type: String,
      enum: ['ABIERTO', 'CERRADO'],
      default: 'ABIERTO'
    },

    comments: [CommentSchema],
    evidences: [{ type: String }],
    reportedBy: { type: String, required: true },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<ICase>('Case', CaseSchema);