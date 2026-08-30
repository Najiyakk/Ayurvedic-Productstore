
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, MapPin, CreditCard } from "lucide-react";
import { supabase } from "../lib/supabase";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product;
  const cartFromState = location.state?.cart;

  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    house: "",
    city: "",
    state: "",
    pincode: "",
    payment_method: "cod",
  });

  // If user opens /checkout directly
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 px-4">
        <ShoppingBag size={55} className="text-green-700" />

        <h1 className="mt-4 text-2xl font-bold text-green-900">
          No product selected
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Please select a product before proceeding to checkout.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const cartItems = cartFromState?.length
    ? cartFromState
    : product
      ? [{ ...product, quantity }]
      : [];
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // 1. Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login before placing an order.");
        navigate("/login");
        return;
      }

      // 2. Create shipping address
      const shippingAddress = {
        name: formData.customer_name,
        house: formData.house,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      // 3. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: formData.customer_name,
          phone: formData.phone,
          shipping_address: shippingAddress,
          total: total,
          payment_method: formData.payment_method,
          payment_status:
            formData.payment_method === "cod"
              ? "pending"
              : "pending",
          status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // 4. Create order items
      const { error: itemError } = await supabase
        .from("order_items")
        .insert(
          cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_image:
              item.images && item.images.length > 0
                ? item.images[0]
                : null,
            quantity: item.quantity,
            price: item.price,
            subtotal: Number(item.price) * item.quantity,
          }))
        );

      if (itemError) {
        throw itemError;
      }

      if (cartFromState?.length) {
        localStorage.removeItem("ayurveda-cart");
      }

      // ============================
      // COD ORDER
      // ============================
      if (formData.payment_method === "cod") {
        alert("Order placed successfully! 🎉");

        navigate("/");
        return;
      }

      // ============================
      // ONLINE UPI PAYMENT
      // ============================
      navigate("/online-payment", {
        state: {
          order,
          product,
          quantity,
        },
      });

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">

      {/* Error */}
      {error && (
        <div className="mx-auto mb-4 max-w-5xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Checkout Form */}
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-3 text-green-800">
                <MapPin size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-green-900">
                  Checkout
                </h1>

                <p className="text-sm text-gray-500">
                  Enter your delivery details.
                </p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">

              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />
              </div>

              {/* House */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  House / Street
                </label>

                <textarea
                  name="house"
                  value={formData.house}
                  onChange={handleChange}
                  required
                  placeholder="House name, street"
                  rows="3"
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />
              </div>

              {/* City */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Enter your city"
                  className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                />
              </div>

              {/* State + Pincode */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="Kerala"
                    className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder="678001"
                    className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
                  />
                </div>

              </div>

              {/* Payment Method */}
              <div className="pt-2">

                <label className="mb-3 flex items-center gap-2 font-medium">
                  <CreditCard size={18} />
                  Payment Method
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* COD */}
                  <label
                    className={`cursor-pointer rounded-xl border-2 p-4 ${
                      formData.payment_method === "cod"
                        ? "border-green-700 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === "cod"}
                      onChange={handleChange}
                      className="mr-2"
                    />

                    Cash on Delivery
                  </label>

                  {/* Online */}
                  <label
                    className={`cursor-pointer rounded-xl border-2 p-4 ${
                      formData.payment_method === "online"
                        ? "border-green-700 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={formData.payment_method === "online"}
                      onChange={handleChange}
                      className="mr-2"
                    />

                    Pay via UPI
                  </label>

                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-4 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
              >
                <ShoppingBag size={20} />

                {loading
                  ? "Processing..."
                  : formData.payment_method === "cod"
                  ? "Place COD Order"
                  : `Pay ₹${total} via UPI`}
              </button>

            </form>

          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-2xl bg-white p-5 shadow-sm sm:p-6 md:p-8">

            <h2 className="text-xl font-bold text-green-900">
              Order Summary
            </h2>

            <div className="mt-6 flex gap-4">

              <div className="h-24 w-24 overflow-hidden rounded-xl bg-green-50">

                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="text-green-700" />
                  </div>
                )}

              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-gray-800">
                  {product.name}
                </h3>

                <p className="mt-1 text-green-700">
                  ₹{product.price}
                </p>

                {/* Quantity */}
                <div className="mt-3 flex items-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) =>
                        prev > 1 ? prev - 1 : 1
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 font-bold hover:bg-gray-200"
                  >
                    −
                  </button>

                  <span className="font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) =>
                        prev < product.stock
                          ? prev + 1
                          : prev
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 font-bold hover:bg-gray-200"
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

            {/* Total */}
            <div className="mt-8 border-t pt-5">

              <div className="flex justify-between text-gray-600">
                <span>Price</span>
                <span>
                  ₹{product.price} × {quantity}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-700">Free</span>
              </div>

              <div className="mt-5 flex justify-between border-t pt-5 text-xl font-bold text-green-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;
