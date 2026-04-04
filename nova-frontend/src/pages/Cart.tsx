import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ScrollReveal from "@/components/ScrollReveal";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-20">
        <ScrollReveal className="text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/40" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">Discover our collection and find something you love.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-all hover:shadow-lg active:scale-[0.97]"
          >
            Continue Shopping
          </Link>
        </ScrollReveal>
      </main>
    );
  }

  return (
    <main className="pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <ScrollReveal>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>Shopping Cart</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cart.length} item{cart.length > 1 ? "s" : ""}</p>
        </ScrollReveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item, i) => (
              <ScrollReveal key={item._id} delay={i * 80}>
                <div className="flex gap-3 rounded-lg border bg-card p-3 sm:gap-4 sm:p-4">
                  <Link to={`/product/${item._id}`} className="shrink-0">
                    <img src={item.image} alt={item.name} className="h-24 w-20 rounded-md object-cover sm:h-28 sm:w-24" />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <Link to={`/product/${item._id}`} className="font-display text-sm font-semibold text-foreground hover:text-gold transition-colors sm:text-base line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded border text-foreground/70 transition-colors hover:border-foreground active:scale-95"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border text-foreground/70 transition-colors hover:border-foreground active:scale-95"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-bold text-foreground sm:text-base">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-muted-foreground transition-colors hover:text-destructive active:scale-95"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Summary */}
          <ScrollReveal delay={200}>
            <div className="sticky top-24 rounded-lg border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Order Summary</h3>
              <div className="mt-4 space-y-3 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-gold">Free</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold tabular-nums">₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-6 block w-full bg-foreground py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-background transition-all hover:shadow-lg active:scale-[0.97]"
              >
                Proceed to Checkout
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
};

export default Cart;
