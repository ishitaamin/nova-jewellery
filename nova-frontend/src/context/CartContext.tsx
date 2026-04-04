import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { cartAPI, BACKEND_URL } from "@/services/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  category: string;
  description?: string;
}

export interface CartItem extends Product {
  cartItemId: string; // The unique ID of the row in the cart
  quantity: number;
  size: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  cartCount: number;
  cartTotal: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const resolveImage = (img: string) => {
  if (!img || img === "/placeholder.svg") return "/placeholder.svg";
  if (img.startsWith("http")) return img;
  return BACKEND_URL + img;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart([]);
      return;
    }

    try {
      const { data } = await cartAPI.get();

      const items: CartItem[] = (data.items || []).map((item: any) => ({
        cartItemId: item._id, // The unique cart item ID
        _id: item.productId,  // The actual product ID
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image: resolveImage(item.image),
        rating: item.rating || 4.5,
        category: item.category || "",
        quantity: item.qty || item.quantity || 1,
        size: item.size || "Standard", 
      }));
      setCart(items);
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  }, [token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (product: any) => {
    if (!token) { 
      toast({ title: "Please log in", description: "Sign in to add items to cart", variant: "destructive" });
      return; 
    }
    try {
      await cartAPI.add(product._id, 1, product.selectedSize || "Standard");
      await refreshCart();
      toast({ title: "Added to cart", description: `${product.name} (Size: ${product.selectedSize || "Standard"})` });
    } catch { 
      toast({ title: "Failed to add", description: "Please try again", variant: "destructive" });
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await cartAPI.remove(id);
      await refreshCart();
    } catch {
      setCart((prev) => prev.filter((i) => i._id !== id));
    }
  };

  const updateQuantity = async (cartItemId: string, delta: number) => {
    const item = cart.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    try {
      if (newQty <= 0) {
        await cartAPI.remove(item._id); 
      } else {
        await cartAPI.update(cartItemId, newQty);
      }
      await refreshCart();
    } catch {
      // Fixed the fallback logic to correctly reference cartItemId
      setCart((prev) =>
        prev
          .map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + delta } : i
          )
          .filter((i) => i.quantity > 0)
      );
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be within CartProvider");
  return ctx;
};