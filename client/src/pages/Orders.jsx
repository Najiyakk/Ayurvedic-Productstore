import { useEffect, useState } from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) setError(ordersError.message);
      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"><ArrowLeft size={18} /> Home</button>
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-green-700" size={30} />
            <h1 className="text-3xl font-bold text-green-900">My Orders</h1>
          </div>

          {loading && <p className="mt-8 text-gray-500">Loading orders...</p>}
          {error && <p className="mt-8 text-red-700">{error}</p>}
          {!loading && !error && orders.length === 0 && <p className="mt-8 text-gray-500">You have not placed any orders yet.</p>}

          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-xl border border-green-100 p-5 hover:border-green-400 hover:bg-green-50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                    <p className="mt-1 font-semibold text-gray-800">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <p className="text-xl font-bold text-green-800">₹{Number(order.total).toFixed(2)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-blue-100 px-3 py-1 font-medium capitalize text-blue-800">Payment: {order.payment_status || "pending"}</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 font-medium capitalize text-green-800">Order: {order.status || "pending"}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
