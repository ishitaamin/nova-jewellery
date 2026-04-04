import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Menu, X, Search, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import type { Product } from "@/data/products";
import { productsAPI, BACKEND_URL } from "@/services/api";

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Fetch products for search (cache once)
  useEffect(() => {
    productsAPI.getAll()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setAllProducts(list.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice || p.price,
          image: p.image ? (p.image.startsWith("http") ? p.image : BACKEND_URL + p.image) : "/placeholder.svg",
          rating: p.rating || 4.5,
          category: p.category || "",
          description: p.description || "",
        })));
      })
      .catch(() => {});
  }, []);

  const filtered = searchQuery.trim().length > 1
    ? allProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const goToProduct = (id: number | string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/cart", label: "Cart" },
    { to: "/wishlist", label: "Wishlist" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:h-20">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-semibold tracking-[0.2em] text-charcoal lg:text-3xl">
          NOVA
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                location.pathname === l.to ? "text-gold" : "text-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-foreground/70 transition-colors hover:text-gold"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border bg-background p-3 shadow-lg md:w-80">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search jewellery..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </form>
                {filtered.length > 0 && (
                  <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
                    {filtered.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => goToProduct(p.id)}
                        className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-secondary"
                      >
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">₹{p.price.toLocaleString("en-IN")}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link to="/wishlist" className="relative text-foreground/70 transition-colors hover:text-gold">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-primary-foreground">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative text-foreground/70 transition-colors hover:text-gold">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <Link to="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-primary-foreground transition-transform hover:scale-105">
              <User size={16} />
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-medium text-foreground/70 transition-colors hover:text-gold">
              Login
            </Link>
          )}

          <button
            className="text-foreground/70 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block py-3 text-sm font-medium tracking-wide transition-colors ${
                location.pathname === l.to ? "text-gold" : "text-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" className="block py-3 text-sm font-medium tracking-wide text-foreground/70">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
