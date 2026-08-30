import { useState } from "react";
import { ArrowLeft, Heart, Package, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const WISHLIST_KEY = "ayurveda-wishlist";

function readWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(readWishlist);

  const removeItem = (productId) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  return (
    <div className="min-h-screen bg-[#f8faf5] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-full bg-pink-100 p-3 text-pink-600">
            <Heart size={25} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-green-900">My Wishlist</h1>
            <p className="text-gray-500">Products you want to save for later.</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Heart size={44} className="mx-auto text-pink-300" />
            <h2 className="mt-4 text-xl font-semibold text-green-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-gray-500">Save products here while you browse.</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 font-semibold text-white hover:bg-green-900"
            >
              <ShoppingBag size={18} />
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="relative h-52 bg-green-50">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-green-700"><Package size={48} /></div>
                  )}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow-md hover:bg-red-50"
                    title={`Remove ${product.name}`}
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-green-900">{product.name}</h2>
                  <p className="mt-2 font-semibold text-green-700">₹{product.price}</p>
                  <button
                    onClick={() => navigate("/checkout", { state: { product } })}
                    disabled={product.stock <= 0}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:bg-gray-300"
                  >
                    <ShoppingBag size={18} />
                    Buy Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
