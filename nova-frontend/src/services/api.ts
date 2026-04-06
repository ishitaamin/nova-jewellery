import axios, { InternalAxiosRequestConfig } from "axios";

// ✅ Backend URL from env
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ✅ Remove trailing slash safety
const API_BASE_URL = `${BASE_URL.replace(/\/$/, "")}/api`;

export const BACKEND_URL = BASE_URL;

// ✅ Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach JWT token
// ✅ Attach JWT token securely based on which panel the user is in
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Check if the user is currently browsing the /admin pages
  const isAdminPanel = window.location.pathname.startsWith("/admin");
  
  // Use the admin token for admin pages, and normal token for storefront
  const token = isAdminPanel 
    ? localStorage.getItem("admin-token") 
    : localStorage.getItem("token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= AUTH =================
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  verifyOTP: (email: string, otp: string) =>
    api.post("/auth/verify-otp", { email, otp }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post("/auth/reset-password", { email, otp, newPassword }),

  adminLogin: (email: string, password: string) =>
    api.post("/auth/admin-login", { email, password }),
};

// ================= PRODUCTS =================
export const productsAPI = {
  getAll: (params?: {
    keyword?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => api.get("/products", { params }),

  getById: (id: string) => api.get(`/products/${id}`),

  create: (data: FormData) => 
    api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/products/${id}`),

  createReview: (
    id: string,
    review: { rating: number; comment: string }
  ) => api.post(`/products/${id}/reviews`, review),
};

// ================= CART =================
export const cartAPI = {
  get: () => api.get("/cart"),

  add: (
    productId: string,
    qty: number = 1,
    size: string = "Standard"
  ) => api.post("/cart", { productId, qty, size }),

  update: (itemId: string, qty: number) =>
    api.put("/cart", { itemId, qty }),

  remove: (productId: string) =>
    api.delete(`/cart/${productId}`),
};

// ================= WISHLIST =================
export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (productId: string) =>
    api.post("/wishlist", { productId }),
};

// ================= ORDERS =================
export const ordersAPI = {
  getMyOrders: () => api.get("/orders/my"),
  create: (orderItems: any[], totalPrice: number) =>
    api.post("/orders", { orderItems, totalPrice }),
  getAll: () => api.get("/orders"),
};

// ================= PAYMENT =================
export const paymentAPI = {
  createOrder: (amount: number, selectedItemIds: string[]) =>
    api.post("/payment/create-order", { amount, selectedItemIds }),

  verify: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    selectedItemIds: string[];
    shippingAddress: {
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
  }) => api.post("/payment/verify", data),
};

// ================= ADDRESS =================
export const addressAPI = {
  getAll: () => api.get("/addresses"),
  add: (data: any) => api.post("/addresses", data),
  update: (id: string, data: any) =>
    api.put(`/addresses/${id}`, data),
  remove: (id: string) =>
    api.delete(`/addresses/${id}`),
};

// ================= USERS =================
export const usersAPI = {
  getAll: () => api.get("/auth/users"),
};

export default api;