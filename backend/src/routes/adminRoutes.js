import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', adminController.getDashboardStats);

router.route('/categories')
  .get(adminController.getCategories)
  .post(adminController.createCategory);
router.route('/categories/:id')
  .put(adminController.updateCategory)
  .delete(adminController.deleteCategory);


router.post('/products', upload.single('image'), adminController.createProduct);
router.put('/products/:id', upload.single('image'), adminController.updateProduct);

router.route('/products')
  .get(adminController.getProducts)
  ;
router.route('/products/:id')
  .delete(adminController.deleteProduct);

router.route('/orders')
  .get(adminController.getAllOrders);
router.route('/orders/:id')
  .put(adminController.updateOrderStatus)
  .delete(adminController.deleteOrder);

router.get('/logs', adminController.getLogs);
router.delete('/logs', protect, adminOnly, adminController.clearLogs);
export default router;