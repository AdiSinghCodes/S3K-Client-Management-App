import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, initializeDatabase } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import projectRoutes from './routes/project.routes.js';
import usecaseRoutes from './routes/usecase.routes.js';
import trainingRoutes from './routes/training.routes.js';
import reportRoutes from './routes/report.routes.js';
import reviewRoutes from './routes/review.routes.js';
import costRoutes from './routes/cost.routes.js';
import productivityRoutes from './routes/productivity.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/usecases', usecaseRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/productivity', productivityRoutes);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'S3K Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to S3K Client Governance CRM API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, async () => {
  console.log(`\n✅ S3K Backend Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}\n`);
  
  // Initialize database
  console.log('🔄 Connecting to database...');
  const dbConnected = await connectDB();
  
  if (dbConnected) {
    console.log('🔄 Initializing database tables...');
    await initializeDatabase();
    console.log('✅ Database ready!\n');
  } else {
    console.error('❌ Failed to connect to database');
  }
});
