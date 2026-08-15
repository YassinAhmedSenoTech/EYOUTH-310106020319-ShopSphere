try {
  console.log('>>> APP.JS STARTING...');
  
  console.log('>>> Loading dotenv...');
  import 'dotenv/config';
  
  console.log('>>> Loading express...');
  import express from 'express';
  
  console.log('>>> Loading cors...');
  import cors from 'cors';
  
  console.log('>>> Loading helmet...');
  import helmet from 'helmet';
  
  console.log('>>> Loading rate-limit...');
  import rateLimit from 'express-rate-limit';
  
  console.log('>>> Loading db.js...');
  import { connectMongoDB } from './config/db.js';
  
  console.log('>>> Loading authRoutes...');
  import authRoutes from './routes/authRoutes.js';
  
  console.log('>>> Loading userRoutes...');
  import userRoutes from './routes/userRoutes.js';
  
  console.log('>>> Loading productRoutes...');
  import productRoutes from './routes/productRoutes.js';
  
  console.log('>>> Loading categoryRoutes...');
  import categoryRoutes from './routes/CategoryRoutes.js';
  
  console.log('>>> Loading cartRoutes...');
  import cartRoutes from './routes/cartRoutes.js';
  
  console.log('>>> Loading orderRoutes...');
  import orderRoutes from './routes/orderRoutes.js';
  
  console.log('>>> Loading reviewRoutes...');
  import reviewRoutes from './routes/reviewRoutes.js';
  
  console.log('>>> Loading adminRoutes...');
  import adminRoutes from './routes/adminRoutes.js';
  
  console.log('>>> All imports successful!');

  const app = express();
  const PORT = process.env.PORT || 5000;

  if (process.env.NODE_ENV !== 'test' && process.env.MONGODB_URI) {
    connectMongoDB().catch(err => {
      console.warn('MongoDB connection failed:', err.message);
    });
  }

  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use(limiter);

  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  app.use('/api/products', productRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running!' });
  });

  app.get('/', (req, res) => {
    res.json({ status: 'active', message: 'E-commerce Engine Online' });
  });

  app.use((err, req, res, next) => {
    console.error('ERROR:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });

  if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  console.log('>>> APP.JS COMPLETE');
  export default app;

} catch (err) {
  console.error('>>> FATAL ERROR DURING STARTUP:', err.message);
  console.error(err.stack);
  
  // Export a dummy app that shows the error
  import express from 'express';
  const app = express();
  app.use((req, res) => {
    res.status(500).json({ 
      error: 'Startup failed', 
      message: err.message,
      stack: err.stack 
    });
  });
  export default app;
}