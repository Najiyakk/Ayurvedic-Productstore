import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Eye,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setProducts(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id, productName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Product deleted successfully");

    fetchProducts();
  };

  return (
    <div className="mx-auto max-w-6xl">

      {/* Top Section */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900 md:text-3xl">
          Products
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View, edit, and manage your products.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500">
          Loading products...
        </p>
      )}

      {/* No Products */}
      {!loading && products.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <Package
            size={50}
            className="mx-auto mb-4 text-green-700"
          />

          <h2 className="text-lg font-semibold">
            No products found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Go to the Dashboard and click Add Product to add your first product.
          </p>

        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {products.map((product) => (

            <div
              key={product.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
            >

              {/* Product Image */}
              <div className="h-48 bg-green-50">

                {product.images && product.images.length > 0 ? (

                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />

                ) : (

                  <div className="flex h-full items-center justify-center">
                    <Package
                      size={50}
                      className="text-green-700"
                    />
                  </div>

                )}

              </div>

              {/* Product Details */}
              <div className="p-5">

                {/* Category */}
                <p className="text-xs font-medium text-green-700">
                  {product.categories?.name || "No Category"}
                </p>

                {/* Product Name */}
                <h2 className="mt-1 text-lg font-semibold text-gray-800">
                  {product.name}
                </h2>

                {/* Description */}
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {product.description || "No description"}
                </p>

                {/* Price and Stock */}
                <div className="mt-4 flex items-center justify-between">

                  <span className="font-bold text-green-800">
                    ₹{product.price}
                  </span>

                  {product.stock > 0 ? (
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                      In Stock: {product.stock}
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                      Out of Stock
                    </span>
                  )}

                </div>

                {/* Product ID */}
                <p className="mt-3 text-xs text-gray-400">
                  Product ID: #{product.id}
                </p>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-3 gap-2">

                  {/* View */}
                  <button
                    onClick={() =>
                      navigate(`/products/${product.id}`)
                    }
                    className="flex items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Eye size={17} />
                    View
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() =>
                      navigate(`/products/edit/${product.id}`)
                    }
                    className="flex items-center justify-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-200"
                  >
                    <Edit size={17} />
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() =>
                      handleDelete(product.id, product.name)
                    }
                    className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
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

export default Products;