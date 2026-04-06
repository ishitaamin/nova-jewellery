import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js"; // ✅ IMPORTED EMAIL UTILITY

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

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      const err = new Error("Payment verification failed");
      err.statusCode = 400;
      throw err;
    }

    // Get cart from DB
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      const err = new Error("Cart is empty");
      err.statusCode = 400;
      throw err;
    }

    // Calculate total from DB
    let total = 0;

    cart.items.forEach((item) => {
      total += item.product.price * item.qty;
    });

    // Create order
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

    // Reduce stock
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

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // ✅ SEND PAYMENT SUCCESSFUL EMAIL
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Order Confirmation - NOVA Jewellery #${createdOrder._id.toString().slice(-8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #D4AF37; text-align: center;">Thank you for your order!</h2>
            <p>Hi ${req.user.name}, your payment of <strong>₹${total.toLocaleString("en-IN")}</strong> was successful.</p>
            <h3>Order Summary:</h3>
            <ul style="list-style-type: none; padding: 0;">
              ${cart.items.map(item => `<li style="padding: 10px 0; border-bottom: 1px solid #eee;">${item.product.name} (Qty: ${item.qty})</li>`).join('')}
            </ul>
            <p>Your order will be shipped to: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}.</p>
            <p>We will notify you as soon as your order ships!</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.log("Order confirmation email failed to send.", emailErr);
    }

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
    // ✅ POPULATE USER SO WE CAN GET THEIR EMAIL AND NAME
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const previousStatus = order.status;
    const newStatus = req.body.status;
    
    order.status = newStatus;

    if (newStatus === "Delivered" && previousStatus !== "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // ✅ SEND STATUS UPDATE EMAIL IF STATUS CHANGED
    if (previousStatus !== newStatus && (newStatus === "Shipped" || newStatus === "Delivered")) {
      let subject = "";
      let message = "";

      if (newStatus === "Shipped") {
        subject = `Your Order has been Shipped! - NOVA Jewellery #${order._id.toString().slice(-8)}`;
        message = `<p>Great news! Your order is packed and on its way to you.</p>`;
      } else if (newStatus === "Delivered") {
        subject = `Your Order has been Delivered! - NOVA Jewellery #${order._id.toString().slice(-8)}`;
        message = `<p>Your order has been successfully delivered. We hope you love your new jewellery!</p>`;
      }

      try {
        await sendEmail({
          to: order.user.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #D4AF37; text-align: center;">Order Update</h2>
              <p>Hi ${order.user.name},</p>
              ${message}
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
                <p style="margin: 0; margin-top: 5px;"><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString("en-IN")}</p>
                <p style="margin: 0; margin-top: 5px;"><strong>Status:</strong> <span style="color: #D4AF37; font-weight: bold;">${newStatus}</span></p>
              </div>
              <br/>
              <p>Thank you for shopping with NOVA!</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.log("Status update email failed to send.", emailErr);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};