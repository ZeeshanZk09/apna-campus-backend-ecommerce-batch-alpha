import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../controllers/product.controller.js';
import { authAdmin, authUser } from '../middlewares/auth.middleware.js';

const productRouter = Router();

productRouter.route('/').post(authUser, authAdmin, createProduct).get(getAllProducts);

productRouter
  .route('/:id')
  .get(getProductById)
  .put(authUser, authAdmin, updateProduct)
  .delete(authUser, authAdmin, deleteProduct);

export default productRouter;
