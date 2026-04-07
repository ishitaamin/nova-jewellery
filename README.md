# 💎 NOVA Jewellery | Full-Stack MERN E-Commerce

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A modern, luxury e-commerce platform built with the MERN stack. NOVA Jewellery provides a seamless shopping experience for customers and a powerful management dashboard for administrators.  

🚀 **[View Live Demo](#)** *(Add your deployed link here)*

---

## ✨ Key Features

### 🛍️ Customer Experience
* 🔐 **Authentication:** Secure user registration, login, and password recovery using JWT and email OTP verification (Nodemailer).
* 🛒 **Product Catalog:** Browse jewelry by categories (Rings, Necklaces, Earrings, Bracelets, Mangalsutras) with dynamic filtering, search, and pagination.
* ❤️ **Smart Cart & Wishlist:** Size-aware cart functionality (treats different ring sizes as separate items) and seamless wishlist toggling.
* 💳 **Secure Checkout:** Integrated **Razorpay** payment gateway for secure transactions with cryptographic signature verification.
* 👤 **User Dashboard:** Personalized profile section to manage shipping addresses and track real-time order history.

### 🛡️ Admin Dashboard
* 📊 **Overview Analytics:** High-level metrics for total sales, products, and registered users.
* 📦 **Inventory Management:** Full CRUD capabilities for products with image uploading via **Cloudinary**.
* 🚚 **Order Processing:** Track all customer orders and update shipping/delivery statuses.
* 👥 **User Management:** View and manage registered users and their roles.

---

## 🛠️ Technology Stack

**Frontend (`nova-frontend`)**
* React 18 & Vite
* TypeScript
* Tailwind CSS & Shadcn UI
* Framer Motion / Scroll Animations
* TanStack React Query
* React Router DOM

**Backend (`nova-backend`)**
* Node.js & Express.js
* MongoDB & Mongoose
* JWT & bcrypt.js (Authentication & Security)
* Razorpay SDK (Payments)
* Cloudinary API (Media Storage)
* Nodemailer (Email & OTP)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 📌 Prerequisites
* Node.js installed
* MongoDB (Local or Atlas)
* Razorpay Account (Test Mode)
* Cloudinary Account
* Gmail App Password (for email service)

---

### 📥 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/nova-jewellery.git
cd nova-jewellery
```
### 2. Backend Setup
```bash
cd nova-backend
npm install
```
## Create .env file in nova-backend:
```bash
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```
## Start Backend Server
```bash
npm run dev
# Runs on http://localhost:4000
```

### 💻 3. Frontend Setup

## Open a new terminal:
```bash
cd nova-frontend
npm install
```

## Create .env file in nova-frontend:
```bash
VITE_BACKEND_URL=http://localhost:4000
```

## Start Frontend
```bash
npm run dev
# Runs on http://localhost:5173
```

### 📂 Project Structure

```bash
nova/
├── nova-frontend/          # React + Vite + TypeScript Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images and icons
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Contexts (Auth, Cart, Wishlist, Admin)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration (Axios)
│   │   └── types/          # TypeScript interfaces
│
└── nova-backend/           # Node.js + Express Backend
    ├── config/             # DB, Cloudinary, Razorpay configs
    ├── controllers/        # Business logic
    ├── middleware/         # Auth & error handling
    ├── models/             # Mongoose schemas
    ├── routes/             # API routes
    ├── utils/              # Helper functions
    └── server.js           # Entry point

```

### 🔒 Security Practices Implemented
🔐 Password Protection:
Passwords are hashed using bcrypt before storage.
🛡️ JWT Authentication:
Protected routes use secure JWT middleware.
🔑 Environment Security:
Sensitive keys stored in .env (not committed to Git).
✅ Data Validation:
Mongoose validation prevents invalid or malicious data.
💳 Secure Payments:
Idempotency checks prevent duplicate orders/payments.


---

## 🙋‍♀️ Author

<table>
  <tr>
    <td>
      <strong>Ishita Amin</strong><br/>
      👩‍💻 B.Tech CSE @ Navrachana University<br/>
      📬 <a href="mailto:aminishita30@gmail.com">aminishita30@gmail.com</a><br/>
      🔗 <a href="https://linkedin.com/in/ishitaamin](https://www.linkedin.com/in/ishita-amin-841726253" target="_blank">LinkedIn</a><br/>
    </td>
  </tr>
</table>


[Live website ]()
