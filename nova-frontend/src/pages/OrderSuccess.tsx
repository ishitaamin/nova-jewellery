import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const OrderSuccess = () => (
  <main className="flex min-h-screen items-center justify-center px-4 pt-16 lg:pt-20">
    <ScrollReveal className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-light">
        <CheckCircle size={40} className="text-gold" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-foreground md:text-4xl">
        Your order has been placed successfully ✨
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Thank you for shopping with NOVA Jewellery. You will receive a confirmation shortly.
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-flex items-center gap-2 bg-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-background transition-all hover:shadow-lg active:scale-[0.97]"
      >
        Continue Shopping
      </Link>
    </ScrollReveal>
  </main>
);

export default OrderSuccess;
