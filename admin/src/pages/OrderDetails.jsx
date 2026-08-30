import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Save,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch order and order items
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);

      // Get order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) {
        console.error(orderError);
        alert("Order not found");
        navigate("/orders");
        return;
      }

      // Get products inside this order
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsError) {
        console.error(itemsError);
        alert(itemsError.message);
      }

      setOrder(orderData);
      setOrderItems(itemsData || []);
      setStatus(orderData.status || "pending");
      setPaymentStatus(orderData.payment_status || "pending");

      setLoading(false);
    };

    fetchOrderDetails();
  }, [id, navigate]);

  // Update order status
  const handleUpdateStatus = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: status,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Order status updated successfully!");
    setOrder((prev) => ({
      ...prev,
      status: status,
    }));
  };

  // Verify payment proof and update payment status
  const handleUpdatePaymentStatus = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Payment status updated successfully!");
    setOrder((prev) => ({
      ...prev,
      payment_status: paymentStatus,
    }));
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/orders")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      {/* Page Heading */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Order #{order.id}
        </p>

        <h1 className="text-2xl font-bold text-green-900 md:text-3xl">
          Order Details
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left Side */}
        <div className="space-y-6 lg:col-span-2">

          {/* Customer Information */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <User size={20} className="text-green-700" />
              Customer Information
            </h2>

            <div className="space-y-3">

              <div>
                <p className="text-sm text-gray-400">Customer Name</p>
                <p className="font-medium">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Phone Number
                </p>

                <p className="flex items-center gap-2 font-medium">
                  <Phone size={16} />
                  {order.phone}
                </p>
              </div>

            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <MapPin size={20} className="text-green-700" />
              Shipping Address
            </h2>

            <div className="text-gray-600">
              {typeof order.shipping_address === "object" ? (
                <div className="space-y-1">
                  {Object.entries(order.shipping_address).map(
                    ([key, value]) => (
                      <p key={key}>
                        <span className="capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>{" "}
                        {value}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p>{order.shipping_address}</p>
              )}
            </div>
          </div>

          {/* Ordered Products */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800">
              <Package size={20} className="text-green-700" />
              Ordered Products
            </h2>

            {orderItems.length === 0 ? (
              <p className="text-sm text-gray-500">
                No products found for this order.
              </p>
            ) : (
              <div className="space-y-4">

                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border p-3"
                  >
                    {/* Product Image */}
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-50">
                        <Package
                          size={25}
                          className="text-green-700"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-gray-800">
                        {item.product_name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>

                    {/* Subtotal */}
                    <p className="font-bold text-green-800">
                      ₹{item.subtotal}
                    </p>
                  </div>
                ))}

              </div>
            )}
          </div>

        </div>

        {/* Right Side */}
        <div className="space-y-6">

          {/* Payment Information */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <CreditCard size={20} className="text-green-700" />
              Payment
            </h2>

            <div className="space-y-3">

              <div>
                <p className="text-sm text-gray-400">
                  Payment Method
                </p>

                <p className="font-medium">
                  {order.payment_method === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Payment Status
                </p>

                <p className="font-medium capitalize">
                  {order.payment_status}
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-gray-400">
                  Total Amount
                </p>

                <p className="text-2xl font-bold text-green-800">
                  ₹{order.total}
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800">Verify Payment</h3>

                {order.payment_proof_url ? (
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block overflow-hidden rounded-xl border border-green-200 bg-green-50 hover:border-green-500"
                  >
                    <img
                      src={order.payment_proof_url}
                      alt="Customer payment screenshot"
                      className="max-h-64 w-full object-contain"
                    />
                    <span className="flex items-center justify-center gap-2 border-t border-green-200 bg-white px-3 py-2 text-sm font-semibold text-green-700">
                      <ExternalLink size={16} />
                      Open full screenshot
                    </span>
                  </a>
                ) : (
                  <p className="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
                    No payment screenshot submitted yet.
                  </p>
                )}

                <label
                  htmlFor="payment-status"
                  className="mt-4 block text-sm text-gray-400"
                >
                  Payment decision
                </label>

                <select
                  id="payment-status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border p-3 outline-none focus:border-green-600"
                >
                  <option value="pending">Pending Verification</option>
                  <option value="paid">Paid / Verified</option>
                  <option value="failed">Rejected / Failed</option>
                </select>

                <button
                  onClick={handleUpdatePaymentStatus}
                  disabled={saving}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 p-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  <CreditCard size={18} />
                  {saving ? "Saving..." : "Save Payment Status"}
                </button>
              </div>

            </div>
          </div>

          {/* Update Order Status */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Order Status
            </h2>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={handleUpdateStatus}
              disabled={saving}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 p-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
            >
              <Save size={18} />

              {saving
                ? "Updating..."
                : "Update Status"}
            </button>

          </div>

          {/* Order Date */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-400">
              Order Date
            </p>

            <p className="mt-1 font-medium">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
