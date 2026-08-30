import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Eye } from "lucide-react";
import { supabase } from "../lib/supabase";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setOrders(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "processing":
        return "bg-yellow-100 text-yellow-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">

      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900 md:text-3xl">
          Orders
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage customer orders.
        </p>
      </div>

      {/* No Orders */}
      {orders.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <Package
            size={50}
            className="mx-auto mb-4 text-green-700"
          />

          <h2 className="text-lg font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Customer orders will appear here.
          </p>

        </div>
      )}

      {/* Orders */}
      {orders.length > 0 && (
        <div className="space-y-4">

          {orders.map((order) => (

            <div
              key={order.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm text-gray-400">
                    Order #{order.id}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-gray-800">
                    {order.customer_name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.phone}
                  </p>

                  <p className="mt-2 font-semibold text-green-800">
                    ₹{order.total}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                  {/* Payment Method */}
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                    {order.payment_method === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>

                  {/* Order Status */}
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  {/* View Button */}
                  <button
                    onClick={() =>
                      navigate(`/orders/${order.id}`)
                    }
                    className="flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900"
                  >
                    <Eye size={18} />
                    View Order
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default Orders;