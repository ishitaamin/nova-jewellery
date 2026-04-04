import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Plus, Trash2, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addressAPI, paymentAPI } from "@/services/api";
import ScrollReveal from "@/components/ScrollReveal";

interface Address {
  _id: string; // Changed from 'id' to match DB
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const Checkout = () => {
  const { cart, cartTotal, refreshCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [placing, setPlacing] = useState(false);

  // ✅ Fetch Addresses from DB
  useEffect(() => {
    addressAPI.getAll()
      .then(({ data }) => {
        setAddresses(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      })
      .catch(() => toast({ title: "Failed to load addresses", variant: "destructive" }));
  }, []);

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold">Your cart is empty</h2>
          <Link to="/shop" className="mt-4 inline-block text-sm text-gold underline">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  const shipping = cartTotal >= 5000 ? 0 : 499;
  const discount = Math.round(cart.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0));
  const finalTotal = cartTotal + shipping;

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await addressAPI.add(form);
      setAddresses([...addresses, data]);
      setSelectedId(data._id);
      setShowForm(false);
      setForm({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });
      toast({ title: "Address saved" });
    } catch {
      toast({ title: "Error saving address", variant: "destructive" });
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressAPI.remove(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (selectedId === id) setSelectedId("");
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    if (!selectedId) {
      toast({ title: "Please select a delivery address", variant: "destructive" });
      return;
    }
    setPlacing(true);

    try {
      // 1. Create Razorpay order on backend
      const { data: paymentData } = await paymentAPI.createOrder(finalTotal);
      
      const options = {
        key: paymentData.key,
        amount: paymentData.amount * 100, // Amount in paise
        currency: "INR",
        name: "NOVA Jewellery",
        description: "Order Payment",
        order_id: paymentData.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#D4AF37" },
        handler: async (response: any) => {
          try {
            // ✅ Format address for backend
            const selectedAddress = addresses.find((a) => a._id === selectedId);
            const shippingAddress = {
              address: selectedAddress?.address,
              city: selectedAddress?.city,
              postalCode: selectedAddress?.pincode,
              country: "India",
            };

            // 2. Verify payment & Create order (backend does all the work)
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress, // ✅ Pass it here
            });
            
            await refreshCart(); // Clear frontend cart
            toast({ title: "Payment Successful ✨", description: "Your order has been placed!" });
            navigate("/order-success");
          } catch {
            toast({ title: "Verification failed", description: "Please contact support", variant: "destructive" });
          }
          setPlacing(false);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => {
        toast({ title: "Payment failed", description: "Transaction cancelled or failed.", variant: "destructive" });
        setPlacing(false);
      });
      rzp.open();
      
    } catch (err) {
      toast({ title: "Payment Error", description: "Could not initiate payment gateway.", variant: "destructive" });
      setPlacing(false);
    }
  };

  const formFields = [
    { key: "fullName", label: "Full Name", span: false },
    { key: "phone", label: "Phone", span: false },
    { key: "address", label: "Address", span: true },
    { key: "city", label: "City", span: false },
    { key: "state", label: "State", span: false },
    { key: "pincode", label: "Pincode", span: false },
  ];

  return (
    <main className="pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <ScrollReveal>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">Checkout</h1>
        </ScrollReveal>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Left — Address */}
          <div className="flex-1 space-y-6">
            <ScrollReveal>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <MapPin size={18} className="text-gold" /> Delivery Address
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:underline"
                >
                  <Plus size={14} /> Add New
                </button>
              </div>

              {showForm && (
                <form onSubmit={addAddress} className="mt-4 grid gap-4 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-2 sm:p-6">
                  {formFields.map((f) => (
                    <div key={f.key} className={f.span ? "sm:col-span-2" : ""}>
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{f.label}</label>
                      <input
                        required
                        value={(form as any)[f.key]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <button type="submit" className="bg-foreground px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-background transition-all hover:shadow-lg active:scale-[0.97]">
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-4 space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedId(addr._id)}
                    className={`cursor-pointer rounded-lg border-2 bg-card p-4 shadow-sm transition-all sm:p-5 ${
                      selectedId === addr._id ? "border-gold" : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        {selectedId === addr._id && <CheckCircle size={18} className="mt-0.5 shrink-0 text-gold" />}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{addr.fullName}</p>
                          <p className="mt-1 text-sm text-muted-foreground break-words">
                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{addr.phone}</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteAddress(addr._id); }} className="shrink-0 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <p className="text-sm text-muted-foreground">No saved addresses. Add one above.</p>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Right — Summary */}
          <ScrollReveal delay={100} className="w-full lg:w-[380px] lg:shrink-0">
            <div className="rounded-lg border bg-card p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-semibold text-foreground">Order Summary</h2>
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-green-600">−₹{discount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-display text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={placing}
                className="mt-6 w-full bg-gold py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg active:scale-[0.97] disabled:opacity-50"
              >
                {placing ? "Processing..." : "Place Order"}
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
};

export default Checkout;