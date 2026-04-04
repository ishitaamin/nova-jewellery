import { useState, useEffect } from "react";
import { Package, ShoppingCart, Users } from "lucide-react";
import { productsAPI, ordersAPI, usersAPI } from "@/services/api"; // ✅ Imported usersAPI

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });

  useEffect(() => {
    Promise.all([
      // 1. Fetch Products
      // We pass limit: 1 because we don't need the actual data, just the total count!
      productsAPI.getAll({ limit: 1 }).then(({ data }) => {
        // ✅ Read data.total (from our pagination logic) to get the true total in the DB
        return data.total || (data.products ? data.products.length : 0);
      }).catch(() => 0),

      // 2. Fetch Orders
      ordersAPI.getAll().then(({ data }) => {
        const list = Array.isArray(data) ? data : data.orders || [];
        return list.length;
      }).catch(() => 0),

      // 3. Fetch Users (✅ NEW: Live Data)
      usersAPI.getAll().then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        return list.length;
      }).catch(() => 0),

    ]).then(([productCount, orderCount, userCount]) => {
      // ✅ Set all stats using live DB data
      setStats({ products: productCount, orders: orderCount, users: userCount });
    });
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-primary" },
    { label: "Registered Users", value: stats.users, icon: Users, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-3xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;