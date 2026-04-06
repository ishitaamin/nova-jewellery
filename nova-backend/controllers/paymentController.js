import getRazorpayInstance from "../config/razorpay.js";
import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/sendEmail.js";

// ✅ STEP 1: Create Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    // ✅ Extract selectedItemIds sent from the frontend
    const { selectedItemIds } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ Filter to keep ONLY the items the user checked in the UI
    let validItems = cart.items.filter(item => item.product != null);
    if (selectedItemIds && selectedItemIds.length > 0) {
      validItems = validItems.filter(item => selectedItemIds.includes(item._id.toString()));
    }

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid items selected for checkout" });
    }

    const itemTotal = validItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);
    const shippingPrice = itemTotal >= 5000 ? 0 : 499;
    const finalTotal = itemTotal + shippingPrice;

    const options = {
      amount: finalTotal * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpay = getRazorpayInstance(); 
    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: finalTotal, 
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    next(error);
  }
};

// ✅ STEP 2: Verify Payment + Create Order
export const verifyPayment = async (req, res, next) => {
  try {
    // ✅ Extract selectedItemIds here as well
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress, selectedItemIds } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const existingOrder = await Order.findOne({ "paymentResult.id": razorpay_payment_id });
    if (existingOrder) {
      return res.json({ success: true, message: "Order already processed", order: existingOrder });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // ✅ Filter valid items based on selection
    let validItems = cart.items.filter(item => item.product != null);
    if (selectedItemIds && selectedItemIds.length > 0) {
      validItems = validItems.filter(item => selectedItemIds.includes(item._id.toString()));
    }

    const itemTotal = validItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);
    const shippingPrice = itemTotal >= 5000 ? 0 : 499;
    const finalTotal = itemTotal + shippingPrice;

    const order = new Order({
      user: req.user._id,
      orderItems: validItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        qty: item.qty,
        size: item.size || "Standard", 
      })),
      shippingAddress, 
      totalPrice: finalTotal,
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: { id: razorpay_payment_id, status: "success" },
    });

    const createdOrder = await order.save();

    for (const item of validItems) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { countInStock: -item.qty } });
    }

    // 🔥 INSTEAD of deleting the whole cart, we ONLY remove the items that were purchased
    if (selectedItemIds && selectedItemIds.length > 0) {
      cart.items = cart.items.filter(item => !selectedItemIds.includes(item._id.toString()));
      await cart.save();
    } else {
      await Cart.findOneAndDelete({ user: req.user._id }); // Fallback
    }

    // 📧 Send Email Receipt
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Order Confirmation - NOVA Jewellery #${createdOrder._id.toString().slice(-8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #D4AF37; text-align: center;">Thank you for your order!</h2>
            <p>Hi, your payment of <strong>₹${finalTotal.toLocaleString("en-IN")}</strong> was successful.</p>
            <h3>Order Summary:</h3>
            <ul>
              ${validItems.map(item => `<li>${item.product.name} (Size: ${item.size || 'Standard'}) - Qty: ${item.qty}</li>`).join('')}
            </ul>
            <p>Your order will be shipped to: ${shippingAddress.city}, ${shippingAddress.postalCode}.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.log("Receipt email failed to send.", emailErr);
    }

    res.json({ success: true, message: "Payment successful", order: createdOrder });
  } catch (error) {
    next(error);
  }
};