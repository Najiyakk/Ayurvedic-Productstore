import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CART_KEY = "ayurveda-cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(readCart);

  const updateCart = (nextCart) => {
    setCart(nextCart);
    localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
  };

  const changeQuantity = (id, change) => {
    updateCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-green-900">Your Cart</h1>

          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag size={52} className="mx-auto text-green-700" />
              <p className="mt-4 text-gray-500">Your cart is empty.</p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-green-100 p-4"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-lg bg-green-50">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="m-6 text-green-700" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words font-semibold text-gray-800">{item.name}</h2>
                      <p className="mt-1 text-green-700">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border px-2 py-1">
                      <button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity" className="p-1 text-green-700"><Minus size={16} /></button>
                      <span className="w-5 text-center">{item.quantity}</span>
                      <button onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity" className="p-1 text-green-700"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => updateCart(cart.filter((cartItem) => cartItem.id !== item.id))} aria-label={`Remove ${item.name}`} className="p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                <p className="text-2xl font-bold text-green-900">Total: ₹{total.toFixed(2)}</p>
                <Link
                  to="/checkout"
                  state={{ product: cart[0], cart }}
                  className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
                >
                  Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
