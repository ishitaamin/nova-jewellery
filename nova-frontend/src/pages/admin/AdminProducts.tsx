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
  
  const [imageFile, setImageFile] = useState<File | null>(null); 

  // ✅ ADDED: State to track the current page
  const [page, setPage] = useState(1);
  const LIMIT = 10; // Number of items per page

  // ✅ UPDATED: Fetch products based on the current page
  const { data: queryData, refetch, isLoading } = useQuery({
    queryKey: ["adminProducts", page], // Re-fetch when 'page' changes
    queryFn: async () => {
      const { data } = await productsAPI.getAll({ limit: LIMIT, page });
      return data; // Backend returns { products, page, pages, total }
    },
  });

  // Extract products and pagination info safely
  const rawProducts = queryData?.products || [];
  const totalPages = queryData?.pages || 1;
  const totalItems = queryData?.total || 0;

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

  const openAdd = () => { 
    setForm(emptyForm); 
    setEditId(null); 
    setImageFile(null); 
    setShowForm(true); 
  };
  
  const openEdit = (p: any) => {
    setForm({ 
      name: p.name, 
      price: String(p.price), 
      originalPrice: String(p.originalPrice), 
      image: p.image, 
      category: p.category, 
      description: p.description, 
      rating: String(p.rating) 
    });
    setEditId(String(p._id));
    setImageFile(null); 
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price.toString());
    formData.append("originalPrice", form.originalPrice ? form.originalPrice.toString() : form.price.toString());
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("rating", form.rating ? form.rating.toString() : "4.5");

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (form.image && editId) {
      formData.append("image", form.image); 
    }

    try {
      if (editId) {
        await productsAPI.update(editId, formData as any); 
        toast({ title: "Product updated" });
      } else {
        if (!imageFile) {
          toast({ title: "Image required", description: "Please upload an image", variant: "destructive" });
          setSaving(false);
          return;
        }
        await productsAPI.create(formData as any);
        toast({ title: "Product added" });
        setPage(1); // ✅ Reset to first page when adding a new item
      }
      setShowForm(false);
      refetch();
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
      
      // ✅ Adjust page if deleting the last item on the current page
      if (products.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch(); 
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  if (isLoading && products.length === 0) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Manage Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Total products: {totalItems}</p>
        </div>
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
              <label className="text-xs">Product Image</label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }} 
              />
              {editId && !imageFile && (
                <p className="text-[10px] text-muted-foreground mt-1 truncate">
                  Current: {form.image.split('/').pop()}
                </p>
              )}
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

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
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
              {products.length > 0 ? (
                products.map((p: any) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ✅ ADDED: Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">
              Showing Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;