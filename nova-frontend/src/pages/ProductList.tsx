import { useSearchParams, Link } from "react-router-dom";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/types/product";
import { productsAPI, BACKEND_URL } from "@/services/api";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  // ✅ React Query handles everything automatically!
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", activeCategory, searchQuery, currentPage],
    queryFn: async () => {
      const params: any = { page: currentPage, limit: 12 };
      if (searchQuery.trim()) params.keyword = searchQuery;
      if (activeCategory !== "all") params.category = activeCategory;

      const res = await productsAPI.getAll(params);
      return res.data;
    },
  });

  // Map the fetched data securely
  const products = (data?.products || []).map((p: any) => ({
    _id: p._id || p.id || "",
    name: p.name ?? "Unnamed Product",
    price: p.price ?? 0,
    originalPrice: p.originalPrice ?? p.price ?? 0,
    image: p.image?.startsWith("http") ? p.image : `${BACKEND_URL}${p.image}`,
    rating: p.rating ?? 4.5,
    category: p.category ?? "",
  }));

  const totalPages = data?.pages || 1;

  // Helper to update URL params
  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) newParams.set(key, val);
      else newParams.delete(key);
    });
    setSearchParams(newParams);
  };

  return (
    <main className="pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Our Collection</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-foreground md:text-4xl" style={{ lineHeight: 1.15 }}>
              {searchQuery ? `Results for "${capitalize(searchQuery)}"` : activeCategory === "all" ? "All Jewellery" : capitalize(activeCategory)}
            </h1>
          </div>
        </ScrollReveal>

        {/* Category Filters */}
        <ScrollReveal className="mt-8 flex flex-wrap justify-center gap-2">
          {["all", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => updateParams({ category: cat === "all" ? "" : cat, page: "1" })} // Reset to page 1 on category change
              className={`rounded-full px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 active:scale-[0.97] ${
                activeCategory === cat ? "bg-foreground text-background" : "border text-foreground/70 hover:border-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </ScrollReveal>

        {/* Products Grid */}
        {isLoading || isFetching ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <SearchX size={28} className="text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-foreground">No products found</h3>
            <button onClick={() => setSearchParams({})} className="mt-5 rounded-full border px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((p: any, i: number) => (
                <ScrollReveal key={p._id} delay={i * 40}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>

            {/* ✅ Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:bg-secondary disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:bg-secondary disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ProductList;