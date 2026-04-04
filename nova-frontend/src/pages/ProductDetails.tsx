import { useParams, Link } from "react-router-dom";
import { Heart, Star, ShoppingBag, ArrowLeft, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { productsAPI } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ScrollReveal";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ Updated interface to include reviews
interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  numReviews: number;
  category: string;
  description?: string;
  detailedDescription?: string;
  sizes: string[];
  reviews?: Review[]; // ✅ Added reviews array
}

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");

  // ✅ Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const { data } = await productsAPI.getById(id);
      const p = data.product || data;
      const mapped: Product = {
        _id: p._id || p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        image: p.image || "/placeholder.svg",
        rating: p.rating || 0,
        numReviews: p.numReviews || 0,
        category: p.category || "",
        description: p.description || "",
        detailedDescription: p.detailedDescription || "",
        sizes: p.sizes || ["Standard"],
        reviews: p.reviews || [], // Extract reviews
      };
      setProduct(mapped);
      if (!selectedSize) setSelectedSize(mapped.sizes[0] || "");

      // Fetch related
      const { data: allData } = await productsAPI.getAll();
      const list = Array.isArray(allData) ? allData : allData.products || [];
      setRelated(list.filter((r: any) => r.category === mapped.category && r._id !== mapped._id).slice(0, 4));
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProduct();
  }, [id]);

  // ✅ Submit Review Handler
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    try {
      await productsAPI.createReview(id, { rating, comment });
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setRating(5);
      setComment("");
      fetchProduct(); // Refresh product to show new review
    } catch (err: any) {
      toast({ 
        title: "Could not submit review", 
        description: err.response?.data?.message || "Please try again later.", 
        variant: "destructive" 
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <main className="pt-20 text-center"><Skeleton className="h-96 w-[80%] mx-auto" /></main>;
  if (!product) return <main className="pt-20 text-center"><h2 className="text-2xl">Product Not Found</h2></main>;

  const wishlisted = isInWishlist(product._id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <main className="pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        {/* ... (Existing Product Details - Image & Info) ... */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
          <ScrollReveal className="w-full lg:w-1/2">
            <div className="overflow-hidden rounded-lg">
              <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="flex w-full flex-col justify-center lg:w-1/2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{product.category}</span>
            <h1 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl">{product.name}</h1>
            
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border"} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)} ({product.numReviews} Reviews)</span>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
              {discount > 0 && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            {product.detailedDescription && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.detailedDescription}</p>}

            {product.sizes.length > 0 && (
              <div className="mt-6">
                <span className="font-medium text-sm text-foreground mb-2 block">Select Size:</span>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                        selectedSize === size ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => addToCart({ ...product, selectedSize } as any)}
                className="flex flex-1 items-center justify-center gap-2 bg-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-background hover:shadow-lg active:scale-[0.97]"
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex items-center justify-center gap-2 border px-8 py-3.5 text-sm font-semibold uppercase tracking-wider active:scale-[0.97] ${
                  wishlisted ? "border-destructive text-destructive" : "border-border text-foreground hover:border-foreground"
                }`}
              >
                <Heart size={16} className={wishlisted ? "fill-destructive" : ""} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* ✅ NEW: Customer Reviews Section */}
        <section className="mt-20 border-t pt-16">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-2xl font-semibold mb-6">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <p className="text-5xl font-display font-semibold">{product.rating.toFixed(1)}</p>
                <div>
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {product.numReviews} reviews</p>
                </div>
              </div>

              {/* Review Form */}
              {user ? (
                <div className="bg-secondary/20 p-6 rounded-lg mt-8">
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="text-sm mb-2 block text-muted-foreground">Rating</label>
                      <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full border rounded p-2 text-sm">
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm mb-2 block text-muted-foreground">Your Review</label>
                      <textarea required rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border rounded p-3 text-sm focus:ring-2 outline-none" placeholder="What did you like or dislike?" />
                    </div>
                    <button type="submit" disabled={submittingReview} className="w-full bg-foreground text-background py-2.5 rounded text-sm font-semibold uppercase tracking-wider">
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-secondary/20 p-6 rounded-lg mt-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">Please log in to write a review.</p>
                  <Link to="/login" className="inline-block border border-foreground px-6 py-2 text-sm font-semibold uppercase tracking-wider">Log In</Link>
                </div>
              )}
            </div>
              
            {/* Reviews List */}
            <div className="lg:col-span-8 space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "fill-gold text-gold" : "text-border"} />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground mt-8 text-center sm:text-left">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

export default ProductDetails;