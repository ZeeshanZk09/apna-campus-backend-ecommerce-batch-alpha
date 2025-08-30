import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
      minLength: [3, 'Product name must be at least 3 characters'],
      maxLength: [100, 'Product name must be at most 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minLength: [20, 'Product description must be at least 20 characters'],
      maxLength: [2000, 'Product description must be at most 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price must be at least 0'],
      max: [1000000, 'Product price must be at most 1,000,000'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic',
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
      min: [0, 'Product quantity must be at least 0'],
      max: [1000000, 'Product quantity must be at most 1,000,000'],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Sold quantity must be at least 0'],
      max: [1000000, 'Sold quantity must be at most 1,000,000'],
    },
    // images: [
    //   {
    //     url: {
    //       type: String,
    //       required: [true, 'Image URL is required'],
    //     },
    //     altText: {
    //       type: String,
    //       trim: true,
    //       default: '',
    //     },
    //   },
    // ],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be at least 1.0'],
      max: [5.0, 'Rating must be at most 5.0'],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Ratings quantity must be at least 0'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
