import dotenv from "dotenv";
import cloudinary from "cloudinary";
dotenv.config();

import mongoose from "mongoose";
import path from "path";
import Product from "./models/Product.js";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
};

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const products = [
  // ================= EARRINGS (8) =================
  {
    name: "Royal Jhumka Earrings",
    price: 12499,
    originalPrice: 15999,
    image: "/images/earrings-1.jpg",
    rating: 4.8,
    category: "earrings",
    description: "Traditional gold jhumka with pearl drops.",
    detailedDescription: "These royal jhumka earrings are crafted in gold with delicate pearl drops. Perfect for weddings and festive occasions, they bring a touch of elegance and tradition to your ensemble.",
    sizes: ["Standard"]
  },
  {
    name: "Celestial Drop Earrings",
    price: 8750,
    originalPrice: 10500,
    image: "/images/earrings-2.jpg",
    rating: 4.6,
    category: "earrings",
    description: "Elegant teardrop earrings with modern finish.",
    detailedDescription: "Sleek teardrop earrings with a modern finish. Lightweight and comfortable, suitable for casual and party wear.",
    sizes: ["Standard"]
  },
  {
    name: "Polki Chandbali",
    price: 18900,
    originalPrice: 22500,
    image: "/images/earrings-3.jpg",
    rating: 4.9,
    category: "earrings",
    description: "Bridal chandbali with polki stones.",
    detailedDescription: "Traditional bridal chandbali studded with polki stones. Ideal for weddings and festivals.",
    sizes: ["Standard"]
  },
  {
    name: "Lotus Stud Earrings",
    price: 5200,
    originalPrice: 6800,
    image: "/images/earrings-4.jpg",
    rating: 4.4,
    category: "earrings",
    description: "Minimal lotus design gold studs.",
    detailedDescription: "Minimalistic lotus-shaped studs crafted in gold. Perfect for everyday elegance.",
    sizes: ["Standard"]
  },
  {
    name: "Temple Coin Earrings",
    price: 9800,
    originalPrice: 12000,
    image: "/images/earrings-5.jpg",
    rating: 4.5,
    category: "earrings",
    description: "South Indian temple coin style earrings.",
    detailedDescription: "Inspired by South Indian temple coins, these earrings have intricate detailing and cultural appeal.",
    sizes: ["Standard"]
  },
  {
    name: "Tassel Gold Earrings",
    price: 7400,
    originalPrice: 9200,
    image: "/images/earrings-6.jpg",
    rating: 4.3,
    category: "earrings",
    description: "Stylish tassel earrings for party wear.",
    detailedDescription: "Elegant tassel earrings with gold finish, perfect for festive or party wear.",
    sizes: ["Standard"]
  },
  {
    name: "Rose Gold Hoops",
    price: 6100,
    originalPrice: 7500,
    image: "/images/earrings-7.jpg",
    rating: 4.7,
    category: "earrings",
    description: "Modern geometric hoop earrings.",
    detailedDescription: "Contemporary geometric hoops in rose gold. Stylish and trendy for daily or evening wear.",
    sizes: ["Small", "Medium", "Large"]
  },
  {
    name: "Pearl Blossom Studs",
    price: 4800,
    originalPrice: 6200,
    image: "/images/earrings-8.jpg",
    rating: 4.6,
    category: "earrings",
    description: "Elegant pearl cluster studs.",
    detailedDescription: "Cluster of lustrous pearls in elegant studs. Great for formal and casual occasions.",
    sizes: ["Standard"]
  },

  // ================= RINGS (7) =================
  {
    name: "Solitaire Diamond Ring",
    price: 45000,
    originalPrice: 52000,
    image: "/images/ring-1.jpg",
    rating: 4.9,
    category: "rings",
    description: "Classic solitaire diamond ring.",
    detailedDescription: "Exquisite solitaire diamond set on a classic gold band. Ideal for engagements or special occasions.",
    sizes: ["6", "7", "8", "9"]
  },
  {
    name: "Infinity Band Ring",
    price: 9800,
    originalPrice: 12500,
    image: "/images/ring-2.jpg",
    rating: 4.5,
    category: "rings",
    description: "Infinity loop gold ring.",
    detailedDescription: "Elegant infinity design in gold band. Represents eternal love and commitment.",
    sizes: ["6", "7", "8"]
  },
  {
    name: "Emerald Cocktail Ring",
    price: 38500,
    originalPrice: 45000,
    image: "/images/ring-3.jpg",
    rating: 4.8,
    category: "rings",
    description: "Emerald stone statement ring.",
    detailedDescription: "Bold emerald cocktail ring perfect for evening parties and gatherings.",
    sizes: ["6", "7", "8", "9"]
  },
  {
    name: "Mobius Twist Ring",
    price: 7600,
    originalPrice: 9500,
    image: "/images/ring-4.jpg",
    rating: 4.4,
    category: "rings",
    description: "Stylish twist design ring.",
    detailedDescription: "Modern twist design on gold band. Adds elegance and uniqueness.",
    sizes: ["6", "7", "8"]
  },
  {
    name: "Sapphire Trilogy Ring",
    price: 52000,
    originalPrice: 62000,
    image: "/images/ring-5.jpg",
    rating: 5.0,
    category: "rings",
    description: "Premium sapphire diamond ring.",
    detailedDescription: "Luxury sapphire ring with diamond accents. Perfect for premium gifting and engagements.",
    sizes: ["6", "7", "8", "9"]
  },
  {
    name: "Paisley Gold Ring",
    price: 11200,
    originalPrice: 14000,
    image: "/images/ring-6.jpg",
    rating: 4.3,
    category: "rings",
    description: "Traditional paisley carved ring.",
    detailedDescription: "Intricately carved paisley design on gold ring. Ideal for traditional wear.",
    sizes: ["6", "7", "8"]
  },
  {
    name: "Vintage Marcasite Ring",
    price: 6400,
    originalPrice: 8000,
    image: "/images/ring-7.jpg",
    rating: 4.5,
    category: "rings",
    description: "Vintage styled oxidized ring.",
    detailedDescription: "Vintage style ring with marcasite stones. Perfect for antique look lovers.",
    sizes: ["6", "7", "8"]
  },

  // ================= BRACELETS (7) =================
  {
    name: "Charm Bracelet",
    price: 7600,
    originalPrice: 9200,
    image: "/images/bracelet-1.jpg",
    rating: 4.7,
    category: "bracelets",
    description: "Gold bracelet with charm.",
    detailedDescription: "Gold bracelet with delicate charms. Perfect for casual or festive wear.",
    sizes: ["Standard"]
  },
  {
    name: "Geometric Bangle",
    price: 11200,
    originalPrice: 14000,
    image: "/images/bracelet-2.jpg",
    rating: 4.4,
    category: "bracelets",
    description: "Modern geometric gold bangle.",
    detailedDescription: "Sleek geometric design on gold bangle. Adds elegance to daily or party outfits.",
    sizes: ["Standard"]
  },
  {
    name: "Diamond Tennis Bracelet",
    price: 65000,
    originalPrice: 78000,
    image: "/images/bracelet-3.jpg",
    rating: 5.0,
    category: "bracelets",
    description: "Luxury diamond bracelet.",
    detailedDescription: "Premium diamond-studded bracelet. Ideal for gifting or special occasions.",
    sizes: ["Standard"]
  },
  {
    name: "Kundan Kada",
    price: 14500,
    originalPrice: 18000,
    image: "/images/bracelet-4.jpg",
    rating: 4.6,
    category: "bracelets",
    description: "Traditional kundan kada.",
    detailedDescription: "Intricate kundan design on gold bracelet. Perfect for festive wear.",
    sizes: ["Standard"]
  },
  {
    name: "Serpenti Cuff",
    price: 19800,
    originalPrice: 24000,
    image: "/images/bracelet-5.jpg",
    rating: 4.7,
    category: "bracelets",
    description: "Snake design cuff bracelet.",
    detailedDescription: "Snake-inspired cuff bracelet crafted in gold. Bold and stylish.",
    sizes: ["Standard"]
  },
  {
    name: "Whisper Chain Bracelet",
    price: 4200,
    originalPrice: 5500,
    image: "/images/bracelet-6.jpg",
    rating: 4.3,
    category: "bracelets",
    description: "Minimal chain bracelet.",
    detailedDescription: "Simple and elegant chain bracelet. Great for daily wear.",
    sizes: ["Standard"]
  },
  {
    name: "Braided Rope Bangle",
    price: 8900,
    originalPrice: 11000,
    image: "/images/bracelet-7.jpg",
    rating: 4.5,
    category: "bracelets",
    description: "Braided textured bangle.",
    detailedDescription: "Braided rope design on gold bangle. Adds texture and style to any outfit.",
    sizes: ["Standard"]
  },

  // ================= NECKLACES (7) =================
  {
    name: "Teardrop Pendant",
    price: 18500,
    originalPrice: 22000,
    image: "/images/necklace-1.jpg",
    rating: 4.8,
    category: "necklaces",
    description: "Elegant teardrop pendant.",
    detailedDescription: "Gold necklace with teardrop pendant. Elegant for formal occasions.",
    sizes: ["Standard"]
  },
  {
    name: "Layered Chain Necklace",
    price: 14200,
    originalPrice: 17500,
    image: "/images/necklace-2.jpg",
    rating: 4.3,
    category: "necklaces",
    description: "Multi-layer gold chain.",
    detailedDescription: "Layered gold necklace suitable for casual and festive wear.",
    sizes: ["Standard"]
  },
  {
    name: "Gold Choker Necklace",
    price: 28000,
    originalPrice: 34000,
    image: "/images/necklace-3.jpg",
    rating: 4.9,
    category: "necklaces",
    description: "Stylish gold choker.",
    detailedDescription: "Choker necklace with sleek gold design. Perfect for weddings and parties.",
    sizes: ["Standard"]
  },
  {
    name: "Pearl Strand Necklace",
    price: 22500,
    originalPrice: 27000,
    image: "/images/necklace-4.jpg",
    rating: 4.6,
    category: "necklaces",
    description: "Classic pearl necklace.",
    detailedDescription: "Elegant pearl strand necklace. Ideal for formal occasions.",
    sizes: ["Standard"]
  },
  {
    name: "Diamond Necklace",
    price: 95000,
    originalPrice: 115000,
    image: "/images/necklace-5.jpg",
    rating: 5.0,
    category: "necklaces",
    description: "Luxury diamond necklace.",
    detailedDescription: "Premium diamond necklace for weddings or gifting.",
    sizes: ["Standard"]
  },
  {
    name: "Coin Pendant Necklace",
    price: 12800,
    originalPrice: 15500,
    image: "/images/necklace-6.jpg",
    rating: 4.4,
    category: "necklaces",
    description: "Coin style pendant.",
    detailedDescription: "Gold necklace with coin-shaped pendant. Modern and stylish.",
    sizes: ["Standard"]
  },
  {
    name: "Emerald Bar Necklace",
    price: 16200,
    originalPrice: 19500,
    image: "/images/necklace-7.jpg",
    rating: 4.7,
    category: "necklaces",
    description: "Modern emerald bar design.",
    detailedDescription: "Gold necklace with emerald bar pendant. Sleek and contemporary.",
    sizes: ["Standard"]
  },

  // ================= MANGALSUTRA (7) =================
  {
    name: "Classic Mangalsutra",
    price: 22000,
    originalPrice: 26000,
    image: "/images/mangalsutra-1.jpg",
    rating: 4.9,
    category: "mangalsutras",
    description: "Traditional mangalsutra design.",
    detailedDescription: "Black beads with gold pendant, a timeless traditional design.",
    sizes: ["Standard"]
  },
  {
    name: "Diamond Mangalsutra",
    price: 35000,
    originalPrice: 42000,
    image: "/images/mangalsutra-2.jpg",
    rating: 4.7,
    category: "mangalsutras",
    description: "Diamond pendant mangalsutra.",
    detailedDescription: "Elegant mangalsutra with diamond-studded pendant. Perfect for special occasions.",
    sizes: ["Standard"]
  },
  {
    name: "Floral Mangalsutra",
    price: 19500,
    originalPrice: 24000,
    image: "/images/mangalsutra-3.jpg",
    rating: 4.6,
    category: "mangalsutras",
    description: "Floral design mangalsutra.",
    detailedDescription: "Gold mangalsutra with floral pendant. Adds charm to traditional outfits.",
    sizes: ["Standard"]
  },
  {
    name: "Bar Style Mangalsutra",
    price: 15800,
    originalPrice: 19000,
    image: "/images/mangalsutra-4.jpg",
    rating: 4.5,
    category: "mangalsutras",
    description: "Minimal bar style design.",
    detailedDescription: "Simple bar pendant mangalsutra for modern minimalists.",
    sizes: ["Standard"]
  },
  {
    name: "Nazar Mangalsutra",
    price: 17200,
    originalPrice: 21000,
    image: "/images/mangalsutra-5.jpg",
    rating: 4.4,
    category: "mangalsutras",
    description: "Nazar protection pendant.",
    detailedDescription: "Mangalsutra with traditional black bead and nazar charm for protection.",
    sizes: ["Standard"]
  },
  {
    name: "Layered Mangalsutra",
    price: 28500,
    originalPrice: 34000,
    image: "/images/mangalsutra-6.jpg",
    rating: 4.8,
    category: "mangalsutras",
    description: "Double layer design.",
    detailedDescription: "Elegant double-layered mangalsutra for festive occasions.",
    sizes: ["Standard"]
  },
  {
    name: "Heart Mangalsutra",
    price: 24000,
    originalPrice: 29000,
    image: "/images/mangalsutra-7.jpg",
    rating: 4.7,
    category: "mangalsutras",
    description: "Heart pendant mangalsutra.",
    detailedDescription: "Gold mangalsutra with heart-shaped pendant. Romantic and elegant.",
    sizes: ["Standard"]
  },
];

// Helper to upload images to Cloudinary
const uploadImage = async (localPath) => {
  const fullPath = path.join(process.cwd(), "public", localPath.replace("/images/", "images/"));
  const result = await cloudinary.v2.uploader.upload(fullPath, {
    folder: "products",
  });
  return result.secure_url;
};

// Seed function
const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log("🗑️ Existing products removed");

    for (const product of products) {
      const cloudUrl = await uploadImage(product.image);
      product.image = cloudUrl;

      await Product.create(product);
      console.log(`✅ Uploaded & created product: ${product.name}`);
    }

    console.log("🎉 ALL PRODUCTS INSERTED WITH CLOUDINARY IMAGES, DETAILS & SIZES");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();