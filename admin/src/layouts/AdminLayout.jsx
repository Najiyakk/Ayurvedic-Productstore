import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import StoreBrand from "../components/StoreBrand";

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-green-50 p-3 sm:p-4 md:p-8">

      {/* Top Bar */}
      <div className="mb-6 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
        <StoreBrand />
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600 sm:py-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Page Content */}
      <Outlet />

    </div>
  );
}

export default AdminLayout;
