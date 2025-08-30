import Product from '../models/product.model.js';
import { ApiResponse } from '../utilities/ApiResponse';
import requestHandler from '../utilities/requestHandler.js';

const createProduct = requestHandler(async (req, res, next) => {
  const { name, description, price, category, brand, quantity, sold } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    quantity,
    sold,
  });
  return res.status(201).json(new ApiResponse(201, {
    
  }));
});

export { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct };
