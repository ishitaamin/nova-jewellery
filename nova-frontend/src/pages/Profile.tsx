import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { User, Package, MapPin, Plus, Trash2, Pencil, LogOut, ChevronRight, CheckCircle, Clock, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersAPI, addressAPI } from "@/services/api";
import ScrollReveal from "@/components/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query"; // ✅ IMPORTED THIS

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

interface Order {
  _id: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  orderItems: OrderItem[];
}

const emptyForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  if (!user) return <Navigate to="/login" replace />;

  // ✅ COMPLETELY REPLACED useState/useEffect WITH useQuery
  const { data: addresses = [], refetch: refetchAddresses, isLoading: loadingAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await addressAPI.getAll();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user, // ✅ IMPORTANT
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const { data } = await ordersAPI.getMyOrders();
      return Array.isArray(data) ? data : data.orders || [];
    },
    enabled: !!user, // ✅ IMPORTANT
  });

  const loading = loadingAddresses || loadingOrders;

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressAPI.update(editingId, form);
        toast({ title: "Address updated successfully" });
      } else {
        await addressAPI.add(form);
        toast({ title: "Address saved successfully" });
      }
      refetchAddresses(); // ✅ Auto-updates the UI securely
      resetForm();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been securely logged out." });
    navigate("/login");
  };
  const startEdit = (addr: Address) => {
    setForm(addr);
    setEditingId(addr._id);
    setShowForm(true);
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressAPI.remove(id);
      refetchAddresses(); // ✅ Auto-updates the UI securely
      toast({ title: "Address removed" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <main className="pt-20 container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <Skeleton className="h-[400px] w-full lg:w-1/4 rounded-lg" />
          <Skeleton className="h-[600px] w-full lg:w-3/4 rounded-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 lg:pt-20 min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <ScrollReveal>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">My Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your orders, addresses, and profile details.</p>
        </ScrollReveal>

        <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <ScrollReveal delay={100} className="w-full lg:w-1/4 shrink-0">
            <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-1 sticky top-24">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "profile" ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"}`}
              >
                <User size={18} /> Profile Overview
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "orders" ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"}`}
              >
                <Package size={18} /> My Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "addresses" ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"}`}
              >
                <MapPin size={18} /> Saved Addresses
              </button>
              <hr className="my-2 border-border" />
              <button
  onClick={handleLogout} // ✅ Updated here
  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
>
  <LogOut size={18} /> Sign Out
</button>
            </div>
          </ScrollReveal>

          {/* Content Area */}
          <ScrollReveal delay={150} className="w-full lg:flex-1">
            <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[500px]">
              
              {/* TAB: PROFILE OVERVIEW */}
              {activeTab === "profile" && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="text-xl font-display font-semibold border-b pb-4">Personal Information</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold text-3xl font-display uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        <CheckCircle size={14} /> Verified Account
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t">
                    <div className="rounded-lg border p-4 bg-secondary/30">
                      <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                      <p className="text-2xl font-semibold">{orders.length}</p>
                    </div>
                    <div className="rounded-lg border p-4 bg-secondary/30">
                      <p className="text-sm text-muted-foreground mb-1">Saved Addresses</p>
                      <p className="text-2xl font-semibold">{addresses.length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ORDERS */}
              {activeTab === "orders" && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-display font-semibold border-b pb-4 mb-6">Order History</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-lg font-medium text-foreground">No orders yet</p>
                      <p className="text-sm text-muted-foreground mt-1 mb-6">When you place an order, it will appear here.</p>
                      <Link to="/shop" className="bg-foreground text-background px-6 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wide">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-4 sm:p-6 transition-all hover:border-foreground/30">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order #{order._id?.slice(-8)}</p>
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Clock size={14} className="text-muted-foreground" />
                                {new Date(order.createdAt!).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="font-semibold">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.isDelivered ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                                {order.isDelivered ? "Delivered" : "Processing"}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Thumbnails */}
                          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="flex shrink-0 items-center gap-3">
                                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover border" />
                                <div className="hidden sm:block text-sm">
                                  <p className="font-medium text-foreground line-clamp-1 max-w-[150px]">{item.name}</p>
                                  <p className="text-muted-foreground">Qty: {item.qty}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 className="text-xl font-display font-semibold">Saved Addresses</h2>
                    {!showForm && (
                      <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-sm font-medium bg-foreground text-background px-4 py-2 rounded-md transition-transform active:scale-95">
                        <Plus size={16} /> Add New
                      </button>
                    )}
                  </div>

                  {showForm && (
                    <div className="mb-8 rounded-lg border p-5 bg-secondary/10">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">{editingId ? "Edit Address" : "Add New Address"}</h3>
                        <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                      </div>
                      <form onSubmit={handleSubmitAddress} className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</label>
                          <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</label>
                          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-muted-foreground uppercase tracking-wider">Street Address</label>
                          <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground uppercase tracking-wider">City</label>
                          <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider">State</label>
                            <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Pincode</label>
                            <input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" />
                          </div>
                        </div>
                        <div className="sm:col-span-2 mt-2">
                          <button type="submit" className="w-full sm:w-auto bg-foreground text-background px-6 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wide">
                            {editingId ? "Update Address" : "Save Address"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.length === 0 && !showForm && (
                      <p className="text-sm text-muted-foreground sm:col-span-2 text-center py-8">No addresses saved yet.</p>
                    )}
                    {addresses.map((addr: Address) => (
                      <div key={addr._id} className="relative rounded-lg border p-5 transition-shadow hover:shadow-md bg-background">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{addr.fullName}</h4>
                          <span className="bg-secondary px-2 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider text-muted-foreground">Home</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {addr.address}<br />
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="mt-2 text-sm font-medium">Phone: {addr.phone}</p>
                        
                        <div className="mt-4 flex gap-3 border-t pt-3">
                          <button onClick={() => startEdit(addr)} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-colors">
                            <Pencil size={12} /> Edit
                          </button>
                          <button onClick={() => deleteAddress(addr._id)} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-destructive hover:text-red-700 transition-colors">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
};

export default Profile;