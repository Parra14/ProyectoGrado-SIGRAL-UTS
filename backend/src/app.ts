import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import caseRoutes from './routes/case.routes';
import userRoutes from './routes/user.routes';
import auditRoutes from './routes/audit.routes';
import reportRoutes from './routes/report.routes';


import path from 'path';



const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditRoutes);

export default app;