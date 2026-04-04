import { Heart, Star, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
// import type { Product } from "@/data/products";
import type { Product } from "@/types/product";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

interface Props {
  product: Product;
  index?: number;
}



const ProductCard = ({ product, index = 0 }: Props) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isInWishlist(product._id);
  const discount = product.originalPrice
  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  : 0;
  return (
    <div
      className="group animate-fade-in rounded-lg bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            className={wishlisted ? "fill-destructive text-destructive" : "text-foreground/50"}
          />
        </button>
        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            -{discount}%
          </span>
        )}
        {/* Quick add */}
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-md bg-foreground/90 py-2.5 text-xs font-medium tracking-wide text-background opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 active:scale-[0.98]"
        >
          <ShoppingBag size={14} />
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </span>
        <Link to={`/product/${product._id}`}>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-foreground transition-colors hover:text-gold">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-1">
          <Star size={13} className="fill-gold text-gold" />
          <span className="text-xs font-medium text-foreground/70">{product.rating}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-foreground">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            ₹{product.originalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
