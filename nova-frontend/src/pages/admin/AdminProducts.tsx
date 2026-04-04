import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { categories, type Product } from "@/types/product";
import { productsAPI, BACKEND_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const emptyForm = { name: "", price: "", originalPrice: "", image: "", category: "Earrings", description: "", rating: "4.5" };

const AdminProducts = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // ✅ React Query Upgrade - Passing limit: 1000 so admins see all items
  const { data: rawProducts = [], refetch, isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const { data } = await productsAPI.getAll({ limit: 1000 });
      return Array.isArray(data) ? data : data.products || [];
    },
  });

  // Map the raw data safely
  const products = rawProducts.map((p: any) => ({
    _id: p._id || p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice || p.price,
    image: p.image ? (p.image.startsWith("http") ? p.image : BACKEND_URL + p.image) : "/placeholder.svg",
    rating: p.rating || 4.5,
    category: p.category || "",
    description: p.description || "",
  }));

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  
  const openEdit = (p: any) => {
    setForm({ name: p.name, price: String(p.price), originalPrice: String(p.originalPrice), image: p.image, category: p.category, description: p.description, rating: String(p.rating) });
    setEditId(String(p._id));
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    
    const payload = {
      name: form.name,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      image: form.image || "/placeholder.svg",
      category: form.category,
      description: form.description,
      rating: Number(form.rating) || 4.5,
    };

    try {
      if (editId) {
        await productsAPI.update(editId, payload);
        toast({ title: "Product updated" });
      } else {
        await productsAPI.create(payload);
        toast({ title: "Product added" });
      }
      setShowForm(false);
      refetch(); // ✅ Instantly updates the table
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsAPI.delete(String(id));
      toast({ title: "Product deleted" });
      refetch(); // ✅ Instantly updates the table
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  if (isLoading && products.length === 0) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Manage Products</h1>
        <Button onClick={openAdd} size="sm" className="bg-foreground text-background">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>
        {editId ? "Edit Product" : "Add Product"}
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">

      <div>
        <label className="text-xs">Name</label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-xs">Image URL</label>
        <Input
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs">Price</label>
        <Input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-xs">Original Price</label>
        <Input
          type="number"
          value={form.originalPrice}
          onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
        />
      </div>

      <div>
        <label className="text-xs">Category</label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm({ ...form, category: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs">Rating</label>
        <Input
          type="number"
          step="0.1"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="text-xs">Description</label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="sm:col-span-2 flex justify-end gap-3 mt-3">
        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell><img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover border" /></TableCell>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell className="font-semibold">₹{p.price.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="uppercase text-xs tracking-wider text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)} className="hover:text-gold"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p._id)} className="hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;