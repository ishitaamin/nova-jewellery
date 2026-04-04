import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import AdminSidebar from "@/components/AdminSidebar";

const AdminLayout = () => {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="md:ml-60 p-6 pt-16 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
