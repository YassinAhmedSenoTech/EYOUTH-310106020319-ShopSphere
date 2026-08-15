import express from 'express';
import { 
  getProducts,
  getProductById, 
  createProduct, 
  updateProduct,  
  deleteProduct   
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

import { upload } from '../middleware/cloudinaryUpload.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.get('/:id', getProductById);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;