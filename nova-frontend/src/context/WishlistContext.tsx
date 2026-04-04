import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { wishlistAPI, BACKEND_URL } from "@/services/api";

// ✅ Updated Product type (NO id, ONLY _id)
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

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const resolveImage = (img: string) => {
  if (!img || img === "/placeholder.svg") return "/placeholder.svg";
  if (img.startsWith("http")) return img;
  return BACKEND_URL + img;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const refreshWishlist = useCallback(async () => {
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const { data } = await wishlistAPI.get();
      
      // ✅ BULLETPROOF EXTRACTION: Ensure we definitely have an array
      let rawItems = [];
      if (Array.isArray(data.items)) {
        rawItems = data.items;
      } else if (Array.isArray(data)) {
        rawItems = data;
      }

      setWishlist(
        rawItems.map((p: any) => ({
          _id: p._id,
          name: p.name || "",
          price: p.price || 0,
          originalPrice: p.originalPrice || p.price || 0,
          image: resolveImage(p.image),
          rating: p.rating || 4.5,
          category: p.category || "",
          description: p.description || "",
        }))
      );
    } catch (error) {
      console.error("Wishlist fetch error:", error);
    }
  }, [token]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // ✅ FIXED (_id instead of id)
  const isInWishlist = (id: string) =>
    wishlist.some((p) => String(p._id) === String(id));

  // ✅ FIXED (_id used everywhere)
  const toggleWishlist = async (product: Product) => {
    if (!token) {
      toast({
        title: "Please log in",
        description: "Sign in to use wishlist",
        variant: "destructive",
      });
      return;
    }

    const wasIn = isInWishlist(product._id);

    try {
      await wishlistAPI.toggle(product._id);
      await refreshWishlist();

      toast({
        title: wasIn ? "Removed from wishlist" : "Added to wishlist",
        description: product.name,
      });
    } catch {
      toast({
        title: "Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // ✅ FIXED (_id used)
  const removeFromWishlist = async (id: string) => {
    try {
      await wishlistAPI.toggle(id);
      await refreshWishlist();
    } catch {
      setWishlist((prev) =>
        prev.filter((p) => String(p._id) !== String(id))
      );
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be within WishlistProvider");
  return ctx;
};