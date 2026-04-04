import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ScrollReveal from "@/components/ScrollReveal";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const moveToCart = (item: typeof wishlist[0]) => {
    addToCart(item);
    removeFromWishlist(item._id); // ✅ FIXED
  };

  if (wishlist.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-20">
        <ScrollReveal className="text-center">
          <Heart size={48} className="mx-auto text-muted-foreground/40" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">Save pieces you love for later.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-all hover:shadow-lg active:scale-[0.97]"
          >
            Explore Collection
          </Link>
        </ScrollReveal>
      </main>
    );
  }

  return (
    <main className="pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <ScrollReveal>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">{wishlist.length} item{wishlist.length > 1 ? "s" : ""}</p>
        </ScrollReveal>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {wishlist.map((item, i) => (
            <ScrollReveal key={item._id} delay={i * 80}> {/* ✅ FIXED */}
              <div className="group rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
                <Link to={`/product/${item._id}`} className="block overflow-hidden rounded-t-lg"> {/* ✅ FIXED */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="p-4">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.category}</span>
                  <h3 className="mt-1 font-display text-base font-semibold text-foreground">{item.name}</h3>
                  <p className="mt-1 font-display text-lg font-bold text-foreground">₹{item.price.toLocaleString("en-IN")}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex flex-1 items-center justify-center gap-1.5 bg-foreground py-2 text-xs font-semibold uppercase tracking-wider text-background transition-all active:scale-[0.97]"
                    >
                      <ShoppingBag size={13} />
                      Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)} 
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive active:scale-95"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Wishlist;