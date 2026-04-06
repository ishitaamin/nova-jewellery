import cloudinary from "cloudinary";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// @desc Get all products (with search + pagination)
// @desc Get all products (with search, category, and PAGINATION)
// @desc Get all products (with search, category, and PAGINATION)
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    const category = req.query.category && req.query.category !== "all"
      ? { category: { $regex: `^${req.query.category}$`, $options: "i" } }
      : {};

    const filter = { ...keyword, ...category };

    const count = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      // ✅ CHANGED THIS: Sorting by name mixes categories naturally on the "All" page!
      .sort({ name: 1 }) 
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};
// @desc Get single product
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid product ID");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findById(id);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create product (ADMIN)
// ADMIN: Create product
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, countInStock } = req.body;
    
    // ✅ Cloudinary automatically uploads it and puts the URL in req.file.path
    const imageUrl = req.file ? req.file.path : "/images/placeholder.jpg"; 

    const product = new Product({
      name,
      price,
      description,
      category,
      countInStock,
      image: imageUrl, // ✅ Save Cloudinary URL to database
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: "Product creation failed" });
  }
};
// @desc Delete product (ADMIN)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product removed",
    });
  } catch (error) {
    next(error);
  }
};


// @desc Create new review
// @route POST /api/products/:id/reviews
// @access Private (Must be logged in)
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    // Create the review object
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    // Update the total number of reviews and calculate new average rating
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc Update a product (ADMIN)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the fields with the new data from the frontend
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.originalPrice = req.body.originalPrice || product.originalPrice;
    product.image = req.body.image || product.image;
    product.category = req.body.category || product.category;
    product.description = req.body.description || product.description;
    product.rating = req.body.rating || product.rating;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};