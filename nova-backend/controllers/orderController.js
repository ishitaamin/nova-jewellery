import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import crypto from "crypto";

// @desc Get logged-in user's orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify payment + create order (FINAL FLOW)
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    // 🔐 Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      const err = new Error("Payment verification failed");
      err.statusCode = 400;
      throw err;
    }

    // 🔥 Get cart from DB (SECURE)
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      const err = new Error("Cart is empty");
      err.statusCode = 400;
      throw err;
    }

    // 🔥 Calculate total from DB
    let total = 0;

    cart.items.forEach((item) => {
      total += item.product.price * item.qty;
    });

    // 🔥 Create order
    const order = new Order({
      user: req.user._id,
      orderItems: cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        qty: item.qty,
      })),
      shippingAddress,
      totalPrice: total,
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: {
        id: razorpay_payment_id,
        status: "success",
      },
    });

    const createdOrder = await order.save();

    // 🔥 Reduce stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) continue;

      if (product.countInStock < item.qty) {
        const err = new Error("Product out of stock");
        err.statusCode = 400;
        throw err;
      }

      product.countInStock -= item.qty;
      await product.save();
    }

    // 🔥 Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all orders (ADMIN)
export const getAllOrders = async (req, res, next) => {
  try {
    // Populate the user so the frontend can display the customer name
    const orders = await Order.find({}).populate("user", "name").sort("-createdAt");
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

// @desc Update order status (ADMIN)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;

    if (req.body.status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};