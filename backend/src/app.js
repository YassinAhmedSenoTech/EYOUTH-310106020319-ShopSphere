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

// const app = express();
// const PORT = process.env.PORT || 5000;

// // MongoDB connection (only if URI exists — safe for Vercel)
// if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
//   connectMongoDB().catch(err => {
//     console.warn('MongoDB connection failed:', err.message);
//   });
// }

// // Security: Helmet
// app.use(helmet());

// // Security: Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { error: 'Too many requests, please try again later.' }
// });
// app.use(limiter);

// // Security: CORS
// const allowedOrigins = [
//   process.env.FRONTEND_URL?.trim(),
//   'http://localhost:3000',
//   'http://localhost:5173'
// ].filter(Boolean);

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());

// // API Routes
// app.use('/api/products', productRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/admin', adminRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'Backend is running!' });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({ status: 'active', message: 'E-commerce Engine Online' });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Internal Server Error' });
// });

// // Only listen locally (NOT on Vercel)
// if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// export default app;




import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectMongoDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/CategoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;




// MongoDB connection (safe for Vercel — won't crash if it fails)
if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
  connectMongoDB().catch(err => {
    console.warn('MongoDB connection failed:', err.message);
  });
}

// Security: Helmet
app.use(helmet());

// Security: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Security: CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running!' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'E-commerce Engine Online' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Only listen locally (NOT on Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;