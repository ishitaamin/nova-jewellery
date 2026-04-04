import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// ✅ GET USER WISHLIST
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("items.product");

    if (!wishlist) {
      return res.json({ success: true, items: [] });
    }

    // 🛡️ CRASH PREVENTION: Filter out products deleted by admin
    const validItems = wishlist.items.filter(item => item.product != null);

    const formatted = validItems.map((item) => ({
      _id: item.product._id, // Return the Product ID for the frontend to use easily
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      originalPrice: item.product.originalPrice || item.product.price,
    }));

    res.json({ success: true, items: formatted });
  } catch (error) {
    next(error);
  }
};

// ✅ TOGGLE WISHLIST (Acts as both Add & Remove based on frontend request)
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if the product is already in the wishlist
    const existingIndex = wishlist.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      // It exists -> REMOVE IT
      wishlist.items.splice(existingIndex, 1);
      await wishlist.save();
      return res.json({ success: true, message: "Removed from wishlist" });
    } else {
      // It does not exist -> ADD IT
      wishlist.items.push({ product: productId });
      await wishlist.save();
      return res.json({ success: true, message: "Added to wishlist" });
    }
  } catch (error) {
    next(error);
  }
};