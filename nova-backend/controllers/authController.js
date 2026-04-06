import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";

// @desc Register User
// @route POST /api/auth/register
// @desc Register User
// @route POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 🚨 DEBUGGING LOGS: This will print in your VS Code terminal!
    console.log("---------------------------------------");
    console.log("REGISTER ATTEMPT RECEIVED!");
    console.log("Name sent:", name);
    console.log("Email sent:", email); 
    console.log("---------------------------------------");

    const userExists = await User.findOne({ email, isAdmin: false });
    if (userExists) {
      // 🚨 DEBUGGING LOG: See EXACTLY what user it found in the database
      console.log("❌ ERROR: Found this user in DB:", userExists);
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
    }

    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp}`);

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
    });

    try {
      await sendEmail({
        to: email,
        subject: "Verify your NOVA account",
        html: `
          <h2>Welcome to NOVA Jewellery!</h2>
          <p>Your OTP verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      });
    } catch (err) {
      console.error("Email failed:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent (or attempted). Please verify.",
      email: user.email,
    });

  } catch (error) {
    next(error);
  }
};

// @desc Get all users (ADMIN ONLY)
export const getUsers = async (req, res, next) => {
  try {
    // .select("-password") ensures we NEVER send hashed passwords to the frontend
    const users = await User.find({}).select("-password").sort("-createdAt");
    res.json(users);
  } catch (error) {
    next(error);
  }
};
// @desc Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isAdmin: false });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendEmail({
      to: email,
      subject: "NOVA - Password Reset Request",
      html: `<h2>Password Reset</h2><p>Your OTP to reset your password is: <strong>${otp}</strong></p><p>If you didn't request this, ignore this email.</p>`,
    });

    res.json({ success: true, message: "Password reset OTP sent to email" });
  } catch (error) {
    next(error);
  }
};

// @desc Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, isAdmin: false }).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== String(otp)) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: "OTP expired" });

    // Save new password (it will be hashed automatically by your pre-save hook)
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, isAdmin: false });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }

    if (user.otp !== String(otp)) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    if (user.otpExpiry < Date.now()) {
      const error = new Error("OTP expired");
      error.statusCode = 400;
      throw error;
    }

    // ... inside verifyOTP ...
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // ✅ INDUSTRY STANDARD: Return the user object WITH the token so the frontend can log them in immediately
    res.json({
      success: true,
      message: "Email verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, "user")
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Login
// @route POST /api/auth/admin-login
export const adminLoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isAdmin: true }).select("+password");

if (!user) {
  throw new Error("Invalid email or password");
}

const isMatch = await user.matchPassword(password);

if (!isMatch) {
  throw new Error("Invalid email or password");
}

res.json({
  success: true,
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id, "admin"), // ✅ correct
});
  } catch (error) {
    next(error);
  }
};
// @desc Login User
// @route POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isAdmin: false }).select("+password");

if (!user) {
  throw new Error("Invalid email or password");
}

if (!user.isVerified) {
  throw new Error("Please verify your email first");
}

const isMatch = await user.matchPassword(password);

if (!isMatch) {
  throw new Error("Invalid email or password");
}

res.json({
  success: true,
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id, "user"), // ✅ FIXED
});
  } catch (error) {
    next(error);
  }
};