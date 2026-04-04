import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc Get user cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) return res.json({ items: [] });

    // ✅ CRASH PREVENTION: Filter out items where the product was deleted by admin
    const validItems = cart.items.filter(item => item.product != null);

    const formattedItems = validItems.map((item) => ({
      _id: item._id, // This is the unique CartItem ID
      productId: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      qty: item.qty,
      size: item.size, // Include size in response
    }));

    res.json({ items: formattedItems });
  } catch (error) {
    next(error);
  }
};

// @desc Add to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, qty, size } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // ✅ SIZE AWARENESS: Match both Product AND Size
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === (size || "Standard")
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty || 1;
    } else {
      cart.items.push({
        product: productId,
        qty: qty || 1,
        size: size || "Standard"
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart" });
  }
};

// @desc Update quantity
export const updateCartItem = async (req, res) => {
  try {
    // Note: We use the CartItem's unique _id here, not the productId, 
    // because there could be multiple of the same product with different sizes!
    const { itemId, qty } = req.body; 

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId); // Mongoose helper to find subdocument
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.qty = qty;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart" });
  }
};

// @desc Remove item
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  res.json(cart);
};

