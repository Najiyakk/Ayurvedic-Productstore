import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Package,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        alert("Product not found");
        navigate("/products");
        return;
      }

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product deleted successfully");
    navigate("/products");
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading product...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">

      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {/* Product Images */}
        <div className="bg-green-50 p-4">
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="h-64 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <Package size={70} className="text-green-700" />
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="p-5 md:p-8">

          <p className="text-sm font-medium text-green-700">
            {product.categories?.name || "No Category"}
          </p>

          <h1 className="mt-1 text-3xl font-bold text-green-900">
            {product.name}
          </h1>

          {/* Price and Stock */}
          <div className="mt-5 flex flex-wrap items-center gap-4">

            <span className="text-2xl font-bold text-green-800">
              ₹{product.price}
            </span>

            {product.stock > 0 ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                In Stock: {product.stock}
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-600">
                Out of Stock
              </span>
            )}

          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800">
                Description
              </h2>

              <p className="mt-2 whitespace-pre-line text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-800">
                Ingredients
              </h2>

              <p className="mt-2 whitespace-pre-line text-gray-600">
                {product.ingredients}
              </p>
            </div>
          )}

          {/* Benefits */}
          {product.benefits && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-800">
                Benefits
              </h2>

              <p className="mt-2 whitespace-pre-line text-gray-600">
                {product.benefits}
              </p>
            </div>
          )}

          {/* Directions */}
          {product.directions && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-800">
                Directions to Use
              </h2>

              <p className="mt-2 whitespace-pre-line text-gray-600">
                {product.directions}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">

            <button
              onClick={() =>
                navigate(`/products/edit/${product.id}`)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-800 px-5 py-3 font-semibold text-white hover:bg-green-900"
            >
              <Edit size={20} />
              Edit Product
            </button>

            <button
              onClick={handleDelete}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-5 py-3 font-semibold text-red-600 hover:bg-red-100"
            >
              <Trash2 size={20} />
              Delete Product
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;