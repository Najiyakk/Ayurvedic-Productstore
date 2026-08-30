import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Package, Truck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (orderError) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemError) setError(itemError.message);
      setOrder(orderData);
      setItems(itemData || []);
      setLoading(false);
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen bg-green-50 p-8 text-center text-gray-500">Loading order...</div>;
  if (error || !order) return <div className="min-h-screen bg-green-50 p-8 text-center text-red-700">{error || "Order not found."}</div>;

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate("/orders")} className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"><ArrowLeft size={18} /> My Orders</button>
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Order #{order.id}</p>
              <h1 className="mt-1 text-3xl font-bold text-green-900">Order Details</h1>
              <p className="mt-2 text-sm text-gray-500">Placed {new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="rounded-full bg-blue-100 px-3 py-1 font-medium capitalize text-blue-800">Payment: {order.payment_status || "pending"}</span>
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium capitalize text-green-800">Order: {order.status || "pending"}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-blue-50 p-5"><CreditCard className="text-blue-700" /><p className="mt-3 text-sm text-gray-500">Payment method</p><p className="font-semibold capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : "Online UPI"}</p></div>
            <div className="rounded-xl bg-green-50 p-5"><Truck className="text-green-700" /><p className="mt-3 text-sm text-gray-500">Delivery status</p><p className="font-semibold capitalize">{order.status || "pending"}</p></div>
          </div>

          <h2 className="mt-8 flex items-center gap-2 text-xl font-bold text-green-900"><Package size={21} /> Items</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border p-3">
                {item.product_image ? <img src={item.product_image} alt={item.product_name} className="h-16 w-16 rounded-lg object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-50"><Package className="text-green-700" /></div>}
                <div className="flex-1"><p className="font-semibold">{item.product_name}</p><p className="text-sm text-gray-500">Quantity: {item.quantity}</p></div>
                <p className="font-bold text-green-800">₹{Number(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-5"><span className="text-lg font-semibold">Total</span><span className="text-2xl font-bold text-green-900">₹{Number(order.total).toFixed(2)}</span></div>
          {order.payment_proof_url && <a href={order.payment_proof_url} target="_blank" rel="noreferrer" className="mt-5 inline-block font-semibold text-green-700 hover:underline">View submitted payment screenshot</a>}
          {order.payment_method !== "cod" && order.payment_status === "pending" && <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">Payment proof is waiting for admin verification.</p>}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
