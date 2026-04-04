import mongoose from "mongoose";

// ✅ 1. Define reviewSchema FIRST so it exists in memory
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ 2. Define productSchema SECOND so it can successfully call [reviewSchema]
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, default: "NOVA Jewellery" },
    category: {
      type: String,
      enum: ["earrings", "rings", "bracelets", "necklaces", "mangalsutras"],
      required: true,
    },
    description: { type: String },
    detailedDescription: { type: String },
    sizes: { type: [String], default: [] },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    countInStock: { type: Number, default: 0 },
    reviews: [reviewSchema], // Successfully referenced here!
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create the text index for searching
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;