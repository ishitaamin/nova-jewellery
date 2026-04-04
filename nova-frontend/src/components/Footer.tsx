import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-secondary/50 px-4 py-12">
    <div className="container mx-auto grid gap-8 text-center sm:grid-cols-2 sm:text-left md:grid-cols-4">
      <div className="sm:col-span-2 md:col-span-1">
        <h4 className="font-display text-xl font-semibold tracking-[0.15em] text-charcoal">NOVA</h4>
        <p className="mt-3 mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground sm:mx-0">
          Timeless jewellery crafted with precision and passion. Each piece tells a story of elegance.
        </p>
        {/* Social Links */}
        <div className="mt-5 flex justify-center gap-4 sm:justify-start">
          {[
            { icon: Instagram, href: "#" },
            { icon: Facebook, href: "#" },
            { icon: Twitter, href: "#" },
          ].map(({ icon: Icon, href }, i) => (
            <a
              key={i}
              href={href}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-gold hover:text-gold"
              aria-label={Icon.displayName}
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
      <div>
        <h5 className="text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h5>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><Link to="/shop" className="transition-colors hover:text-gold">Shop All</Link></li>
          <li><Link to="/cart" className="transition-colors hover:text-gold">Cart</Link></li>
          <li><Link to="/wishlist" className="transition-colors hover:text-gold">Wishlist</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="text-sm font-semibold uppercase tracking-wider text-foreground">Account</h5>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><Link to="/login" className="transition-colors hover:text-gold">Login</Link></li>
          <li><Link to="/register" className="transition-colors hover:text-gold">Register</Link></li>
          <li><Link to="/profile" className="transition-colors hover:text-gold">My Profile</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h5>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>hello@novajewellery.com</li>
          <li>+91 98765 43210</li>
          <li>Mumbai, India</li>
        </ul>
      </div>
    </div>
    <div className="container mx-auto mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
      © 2026 NOVA Jewellery. All rights reserved.
    </div>
  </footer>
);

export default Footer;
