import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Existing images already stored in database
  const [existingImages, setExistingImages] = useState([]);

  // Newly selected image files
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    ingredients: "",
    benefits: "",
    directions: "",
    price: "",
    stock: "",
    category_id: "",
  });

  // Fetch categories and product
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } =
        await supabase
          .from("categories")
          .select("*")
          .order("name");

      if (categoriesError) {
        console.error(categoriesError);
        alert(categoriesError.message);
      } else {
        setCategories(categoriesData);
      }

      // Fetch product
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError) {
        console.error(productError);
        alert("Product not found");
        navigate("/products");
        return;
      }

      // Fill form data
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        ingredients: product.ingredients || "",
        benefits: product.benefits || "",
        directions: product.directions || "",
        price: product.price || "",
        stock: product.stock || "",
        category_id: product.category_id || "",
      });

      // Load existing images
      setExistingImages(product.images || []);

      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const newSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: newSlug,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Select new images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      alert("Please select only image files.");
    }

    setNewImages((prev) => [...prev, ...validFiles]);

    // Allow selecting the same file again
    e.target.value = "";
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Remove newly selected image
  const removeNewImage = (index) => {
    setNewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Upload new images to Supabase Storage
  const uploadImages = async () => {
    const uploadedUrls = [];

    for (const image of newImages) {
      const fileExtension = image.name.split(".").pop();

      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, image);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  // Update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Upload newly selected images
      let uploadedImageUrls = [];

      if (newImages.length > 0) {
        uploadedImageUrls = await uploadImages();
      }

      // Combine existing + new images
      const allImages = [
        ...existingImages,
        ...uploadedImageUrls,
      ];

      // Update product
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          ingredients: formData.ingredients,
          benefits: formData.benefits,
          directions: formData.directions,
          price: Number(formData.price),
          stock: Number(formData.stock) || 0,
          category_id: Number(formData.category_id),
          images: allImages,
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      alert("Product updated successfully! 🎉");

      navigate("/products");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading product...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">

      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm md:p-8">

        <h1 className="text-2xl font-bold text-green-900">
          Edit Product
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Update your product information and images.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          {/* PRODUCT NAME */}
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
            />
          </div>

          {/* CATEGORY */}
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
              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE AND STOCK */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* PRICE */}
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
                min="0"
                className="w-full rounded-lg border p-3"
              />
            </div>

            {/* STOCK */}
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
                min="0"
                className="w-full rounded-lg border p-3"
              />
            </div>

          </div>

          {/* ================= IMAGE SECTION ================= */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Product Images
            </label>

            {/* Upload Button */}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-6 text-green-700 hover:bg-green-100">

              <Upload size={24} />

              <span className="font-medium">
                Click to select product images
              </span>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

            </label>

            {/* EXISTING IMAGES */}
            {existingImages.length > 0 && (
              <div className="mt-5">

                <p className="mb-3 text-sm font-medium">
                  Current Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {existingImages.map((image, index) => (

                    <div
                      key={index}
                      className="relative overflow-hidden rounded-xl border"
                    >

                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingImage(index)
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X size={16} />
                      </button>

                    </div>

                  ))}

                </div>

              </div>
            )}

            {/* NEW IMAGE PREVIEWS */}
            {newImages.length > 0 && (

              <div className="mt-5">

                <p className="mb-3 text-sm font-medium">
                  New Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {newImages.map((image, index) => (

                    <div
                      key={index}
                      className="relative overflow-hidden rounded-xl border"
                    >

                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New product ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(index)
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X size={16} />
                      </button>

                    </div>

                  ))}

                </div>

              </div>
            )}

            {/* NO IMAGES */}
            {existingImages.length === 0 &&
              newImages.length === 0 && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <ImageIcon size={18} />
                  No product images
                </div>
              )}

          </div>

          {/* DESCRIPTION */}
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
            />
          </div>

          {/* INGREDIENTS */}
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

          {/* BENEFITS */}
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

          {/* DIRECTIONS */}
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

          {/* SAVE */}
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 p-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
          >
            <Save size={20} />

            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default EditProduct;