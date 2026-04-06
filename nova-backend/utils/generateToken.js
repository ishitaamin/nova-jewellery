import jwt from "jsonwebtoken";

// ✅ Now accepts a 'role' parameter (defaults to 'user' if not provided)
const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;