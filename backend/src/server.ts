import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import workLogRoutes from './routes/workLogRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const frontendUrl = process.env.FRONTEND_URL || '*';
// Remove trailing slash to match exact origin
const normalizedOrigin = frontendUrl === '*' ? '*' : frontendUrl.replace(/\/$/, '');

const corsOptions = {
  origin: normalizedOrigin,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/work-logs', workLogRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi!' });
});

// Chỉ listen khi không phải serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}

export default app;
