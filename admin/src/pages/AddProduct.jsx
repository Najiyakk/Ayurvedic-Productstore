import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    ingredients: "",
    benefits: "",
    directions: "",
    price: "",
    discount: "",
    stock: "",
    category_id: "",
  });

  // Get categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error(error);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Automatically create slug from product name
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  let imageUrl = null;

  // Upload image to Supabase Storage
  if (image) {
    const fileExt = image.name.split(".").pop();

    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, image);

    if (uploadError) {
      setLoading(false);
      alert(uploadError.message);
      console.error(uploadError);
      return;
    }

    // Get public image URL
    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  // Save product in database
  const { error } = await supabase.from("products").insert([
    {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      ingredients: formData.ingredients,
      benefits: formData.benefits,
      directions: formData.directions,
      price: Number(formData.price),
      discount: Number(formData.discount) || 0,
      stock: Number(formData.stock) || 0,
      category_id: Number(formData.category_id),

      // Save image
      images: imageUrl ? [imageUrl] : [],
    },
  ]);

  setLoading(false);

  if (error) {
    alert(error.message);
    console.error(error);
    return;
  }

  alert("Product added successfully! 🎉");

  navigate("/products");
};

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/products")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-green-900">
          Add New Product
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Add a new Ayurvedic beauty product to your store.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

          {/* Product Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
              placeholder="Example: Natural Herbal Soap"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {/* Product Image */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full rounded-lg border p-3"
              />

              {image && (
                <div className="mt-3">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Product preview"
                    className="h-40 w-40 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Price (₹)
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border p-3"
              placeholder="Describe the product..."
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Ingredients
            </label>

            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Benefits
            </label>

            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* Directions */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Directions to Use
            </label>

            <textarea
              name="directions"
              value={formData.directions}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 p-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
          >
            <Save size={20} />

            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;