import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  year: number;
  sequence: number;
}

const CounterSchema: Schema<ICounter> = new Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  sequence: {
    type: Number,
    default: 0
  }
});

export default mongoose.model<ICounter>('Counter', CounterSchema);