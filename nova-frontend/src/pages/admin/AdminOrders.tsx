import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import api, { ordersAPI } from "@/services/api"; // Added 'api' import for the PUT request
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  _id?: string;
  id?: string;
  customer?: string;
  user?: { name?: string };
  totalPrice?: number;
  total?: number;
  status: string;
  orderItems?: any[];
  items?: any[];
  date?: string;
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Shipped: "bg-blue-100 text-blue-800 border-blue-200",
  Delivered: "bg-green-100 text-green-800 border-green-200",
};

const AdminOrders = () => {
  const { toast } = useToast();

  // ✅ React Query Upgrade
  const { data: orders = [], refetch, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const { data } = await ordersAPI.getAll();
      return Array.isArray(data) ? data : data.orders || [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}`, { status });
      refetch(); // ✅ Instantly updates the UI securely
      toast({ title: "Status updated", description: `Order ${id.slice(0, 8)} marked as ${status}` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Manage Orders</h1>
      {orders.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No orders have been placed yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: Order) => {
                  const oid = o._id || o.id || "";
                  const customerName = o.customer || o.user?.name || "Guest";
                  const itemCount = o.orderItems?.length || o.items?.length || 0;
                  const finalTotal = o.totalPrice || o.total || 0;
                  const dateStr = o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString()
                    : o.date || "";

                  return (
                    <TableRow key={oid}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{oid.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium">{customerName}</TableCell>
                      <TableCell>{itemCount}</TableCell>
                      <TableCell>₹{finalTotal.toLocaleString()}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={v => updateStatus(oid, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <Badge variant="outline" className={statusColors[o.status] || ""}>{o.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{dateStr}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;