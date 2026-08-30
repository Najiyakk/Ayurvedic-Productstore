import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyForm = {
  product_id: "",
  product_name: "",
  instagram_url: "",
  thumbnail_url: "",
};

function Instagram() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }

    setProducts(data || []);
  };

  const fetchVideos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("product_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
      alert(error.message);
    } else {
      setVideos(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchVideos();
  }, []);

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const product = products.find((item) => String(item.id) === String(productId));

    setForm((prev) => ({
      ...prev,
      product_id: productId,
      product_name: product ? product.name : prev.product_name,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setThumbnailFile(null);
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile) {
      return form.thumbnail_url || "";
    }

    const fileExt = thumbnailFile.name.split(".").pop() || "jpg";
    const fileName = `product-video-${Date.now()}.${fileExt}`;
    const bucketOptions = ["video-thumbnails", "products"];

    for (const bucketName of bucketOptions) {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, thumbnailFile, { upsert: true });

      if (!error) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return data.publicUrl;
      }
    }

    throw new Error(
      "Could not upload thumbnail. Please create the video-thumbnails bucket in Supabase Storage or use the products bucket."
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.product_id || !form.instagram_url.trim()) {
      alert("Please select a product and enter an Instagram Reel URL.");
      return;
    }

    setSaving(true);

    try {
      const thumbnailUrl = await uploadThumbnail();
      const selectedProduct = products.find(
        (item) => String(item.id) === String(form.product_id)
      );

      const payload = {
        product_id: Number(form.product_id),
        product_name: selectedProduct?.name || form.product_name || "Product",
        instagram_url: form.instagram_url.trim(),
        thumbnail_url: thumbnailUrl,
      };

      let query = supabase.from("product_videos").insert([payload]);

      if (editingId) {
        query = supabase
          .from("product_videos")
          .update(payload)
          .eq("id", editingId);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      alert(
        editingId
          ? "Product video updated successfully."
          : "Product video added successfully."
      );

      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Error saving product video:", error);
      alert(error.message || "Something went wrong while saving the video.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (video) => {
    setEditingId(video.id);
    setForm({
      product_id: String(video.product_id),
      product_name: video.product_name,
      instagram_url: video.instagram_url,
      thumbnail_url: video.thumbnail_url,
    });
    setThumbnailFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (video) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${video.product_name}" video?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("product_videos")
      .delete()
      .eq("id", video.id);

    if (error) {
      console.error("Error deleting video:", error);
      alert(error.message);
      return;
    }

    alert("Video deleted successfully.");
    fetchVideos();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900 md:text-3xl">
          Product Videos
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage Instagram reels and thumbnails for your products.
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-green-900">
            {editingId ? "Edit Video" : "Add New Video"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Product
            </label>

            <select
              value={form.product_id}
              onChange={handleProductChange}
              className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-green-600"
              required
            >
              <option value="">Select Product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Instagram Reel URL
            </label>

            <input
              type="url"
              value={form.instagram_url}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, instagram_url: event.target.value }))
              }
              placeholder="https://www.instagram.com/reel/..."
              className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-green-600"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Thumbnail Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-200 p-3"
            />

            {thumbnailFile && (
              <img
                src={URL.createObjectURL(thumbnailFile)}
                alt="Thumbnail preview"
                className="mt-3 h-32 w-32 rounded-xl object-cover shadow-sm"
              />
            )}

            {!thumbnailFile && form.thumbnail_url && (
              <img
                src={form.thumbnail_url}
                alt="Current thumbnail"
                className="mt-3 h-32 w-32 rounded-xl object-cover shadow-sm"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Plus size={18} />
                {editingId ? "Update Video" : "Add Video"}
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-5">
        {loading ? (
          <p className="text-center text-gray-500">Loading product videos...</p>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Camera size={48} className="mx-auto mb-3 text-green-700" />
            <h2 className="text-lg font-semibold text-gray-800">
              No product videos yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Add your first Instagram reel to display on the home page.
            </p>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col gap-5 rounded-2xl bg-white p-4 shadow-sm md:flex-row"
            >
              <div className="h-36 w-full overflow-hidden rounded-xl bg-green-50 md:w-48">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.product_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-green-700">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-green-900">
                  {video.product_name}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Instagram Reel:</span>{" "}
                  <a
                    href={video.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-green-700 underline"
                  >
                    {video.instagram_url}
                  </a>
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(video)}
                    className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-200"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(video)}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Instagram;
