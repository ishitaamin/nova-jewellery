import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Award, RotateCcw, Lock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import heroBanner from "@/assets/hero-banner.jpg";
import catEarrings from "@/assets/category-earrings.jpg";
import catRings from "@/assets/category-rings.jpg";
import catBracelets from "@/assets/category-bracelets.jpg";
import catNecklaces from "@/assets/category-necklaces.jpg";
import catMangalsutra from "@/assets/category-mangalsutra.jpg";
import carouselDaily from "@/assets/carousel-daily.jpg";
import carouselParty from "@/assets/carousel-party.jpg";
import carouselDayout from "@/assets/carousel-dayout.jpg";
import carouselDatenight from "@/assets/carousel-datenight.jpg";
import type { Product } from "@/types/product";
import { productsAPI, BACKEND_URL } from "@/services/api";
import ProductCard from "../components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import { useToast } from "@/hooks/use-toast";

const categoryImages: Record<string, string> = {
  earrings: catEarrings,
  rings: catRings,
  bracelets: catBracelets,
  necklaces: catNecklaces,
  mangalsutras: catMangalsutra,
};

const carouselItems = [
  { image: carouselDaily, label: "DAILY WEAR" },
  { image: carouselParty, label: "PARTY WEAR" },
  { image: carouselDayout, label: "DAY OUT" },
  { image: carouselDatenight, label: "DATE NIGHT" },
];

const testimonials = [
  { name: "Priya Sharma", rating: 5, review: "Absolutely stunning earrings! The craftsmanship is impeccable and the gold quality is exceptional. Will definitely order again." },
  { name: "Anita Desai", rating: 5, review: "My mangalsutra from NOVA is a family treasure now. The detailing and purity are beyond expectations. Highly recommend!" },
  { name: "Meera Patel", rating: 4, review: "Beautiful bracelet, received it well-packaged with a certificate. The gold colour is rich and the design is very elegant." },
];

const Home = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productsAPI.getAll()
      .then(({ data }) => {
        const allProducts: Product[] = data.products.map((p) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice || p.price,
          image: p.image.startsWith("http") ? p.image : `http://localhost:4000${p.image}`,
          rating: p.rating || 4.5,
          category: p.category || "Misc",
          description: p.description || "",
        }));
  
        // Pick a mix of products: max 1-2 per category
        const mixed: Product[] = [];
        const usedIds = new Set<string>();
  
        // Shuffle products first
        const shuffled = allProducts.sort(() => Math.random() - 0.5);
  
        // Add products until we have up to 5 featured
        for (const prod of shuffled) {
          if (mixed.length >= 5) break;
          if (!usedIds.has(prod._id)) {
            mixed.push(prod);
            usedIds.add(prod._id);
          }
        }
  
        setFeatured(mixed);
      })
      .catch((err) => console.error(err));
  }, []);
  const scrollCarousel = (dir: number) => {
    const next = (carouselIdx + dir + carouselItems.length) % carouselItems.length;
    setCarouselIdx(next);
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.children[next] as HTMLElement;
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({ title: "Subscribed! ✨", description: "Thank you for joining the NOVA family." });
      setEmail("");
    }
  };
  

  return (
    <main className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[420px] overflow-hidden md:h-[85vh] md:min-h-[520px]">
        <img src={heroBanner} alt="NOVA luxury jewellery collection" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/50 via-foreground/20 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg animate-fade-in">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-background/80">New Collection 2026</p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-background sm:text-5xl md:text-6xl lg:text-7xl" style={{ lineHeight: 1.08 }}>
                Crafted for Eternity
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-background/80 md:text-base">
                Discover handcrafted gold jewellery that celebrates tradition and modern elegance.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex items-center gap-2 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-all duration-200 hover:shadow-lg active:scale-[0.97] sm:px-8 sm:py-3.5 sm:text-sm"
              >
                Explore Collection
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16 lg:py-28">
  <ScrollReveal>
    <div className="text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Browse by</p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>Categories</h2>
    </div>
  </ScrollReveal>
  <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
    {Object.entries(categoryImages).map(([name, img], i) => (
      <ScrollReveal key={name} delay={i * 100}>
        <Link
          to={`/shop?category=${name}`}
          className="group relative block overflow-hidden rounded-lg"
        >
          <img
            src={img}
            alt={name}
            className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="font-display text-base font-semibold text-background sm:text-lg">{name}</h3>
          </div>
        </Link>
      </ScrollReveal>
    ))}
  </div>
</section>

      {/* Featured Products */}
      <section className="bg-secondary/40 px-4 py-16 lg:py-28">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Curated for You</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>Featured Pieces</h2>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            {featured.map((p, i) => (
              <ScrollReveal key={p._id} delay={i * 80}>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-all duration-200 hover:bg-foreground hover:text-background active:scale-[0.97]"
            >
              View All <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* FOR EVERY YOU — Carousel */}
      <section className="py-16 lg:py-28">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Style Guide</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>For Every You</h2>
            </div>
          </ScrollReveal>

          <div className="relative mt-12">
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide sm:gap-4 lg:gap-6 lg:justify-center"
            >
              {carouselItems.map((item, i) => (
                <div
                  key={item.label}
                  className={`group relative flex-shrink-0 cursor-pointer snap-center overflow-hidden rounded-lg transition-all duration-500 w-[220px] sm:w-[240px] md:w-[280px] ${
                    i === carouselIdx ? "lg:w-[340px] scale-100" : "lg:w-[280px] scale-[0.93] opacity-80"
                  }`}
                  onClick={() => setCarouselIdx(i)}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={640}
                    height={896}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="font-display text-base font-semibold tracking-wider text-background sm:text-lg">{item.label}</h3>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => scrollCarousel(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 text-foreground/60 transition-all hover:border-gold hover:text-gold">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollCarousel(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 text-foreground/60 transition-all hover:border-gold hover:text-gold">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Promise Banner */}
      {/* <ScrollReveal>
        <section className="container mx-auto grid gap-8 px-4 py-16 text-center sm:grid-cols-2 md:grid-cols-3 lg:py-28">
          {[
            { title: "Certified Gold", desc: "Every piece is hallmarked and BIS certified for purity." },
            { title: "Free Shipping", desc: "Complimentary insured shipping on all orders above ₹5,000." },
            { title: "Lifetime Exchange", desc: "Exchange your jewellery at full gold value, anytime." },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </section>
      </ScrollReveal> */}

      {/* Why Choose NOVA */}
      <section className="bg-secondary/40 px-4 py-16 lg:py-28">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Our Promise</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>Why Choose NOVA</h2>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { icon: Award, title: "Premium Quality", desc: "Handcrafted with the finest 22K and 18K gold by master artisans." },
              { icon: Shield, title: "Certified Jewellery", desc: "BIS hallmarked and certified for guaranteed purity and authenticity." },
              { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free 15-day returns and lifetime exchange at full gold value." },
              { icon: Lock, title: "Secure Payment", desc: "Bank-grade encryption with multiple secure payment options." },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-light">
                    <item.icon size={22} className="text-gold" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 lg:py-28">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">What Our Clients Say</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>Customer Love</h2>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} className={j < t.rating ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.review}"</p>
                  <p className="mt-4 text-sm font-semibold text-foreground">— {t.name}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      {/* <section className="bg-secondary/40 px-4 py-16 lg:py-28">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="mx-auto max-w-lg text-center">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Stay Updated</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>Join the NOVA Family</h2>
              <p className="mt-3 text-sm text-muted-foreground">Subscribe for exclusive collections, offers, and jewellery inspiration.</p>
              <form onSubmit={handleNewsletter} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg active:scale-[0.97]"
                >
                  <Send size={14} />
                  Subscribe
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section> */}
    </main>
  );
};

export default Home;
