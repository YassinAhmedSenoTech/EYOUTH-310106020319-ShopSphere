// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import { connectMongoDB } from './config/db.js';
// import authRoutes from './routes/authRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import productRoutes from './routes/productRoutes.js';
// import categoryRoutes from './routes/CategoryRoutes.js';
// import cartRoutes from './routes/cartRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import reviewRoutes from './routes/reviewRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import { fileURLToPath } from 'url';
// import path from 'path';

// const app = express();
// const PORT = process.env.PORT || 5000;

// let __filename, __dirname;

// if (process.env.NODE_ENV === 'test') {
//   __dirname = process.cwd();
// } else {
//   __filename = fileURLToPath(import.meta.url);
//   __dirname = path.dirname(__filename);
// }

// if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI && !process.env.VERCEL) {
//   connectMongoDB().catch(err => {
//     console.warn('MongoDB connection failed:', err.message);
//   });
// }

// app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use(limiter);

// const corsOptions = {
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };
// app.use(cors(corsOptions));

// app.use(express.json());

// app.use('/api/products', productRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/admin', adminRoutes);


// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'Backend is running!' });
// });

// app.get('/', (req, res) => {
//   res.json({ status: 'active', message: 'E-commerce Engine Online' });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Internal Server Error' });
// });

// if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// export default app;










import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);


const allowedOrigins = [
  process.env.FRONTEND_URL?.trim(),
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running!' });
});

app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'E-commerce Engine Online' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;