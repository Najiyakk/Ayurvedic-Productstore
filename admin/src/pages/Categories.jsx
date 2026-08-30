import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Tag } from "lucide-react";
import { supabase } from "../lib/supabase";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create slug
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("categories").insert([
      {
        name: categoryName,
        slug: createSlug(categoryName),
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setCategoryName("");
    fetchCategories();
  };

  // Delete category
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchCategories();
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold text-green-900 md:text-3xl">
        Categories
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Add and manage your product categories.
      </p>

      {/* Add Category Form */}
      <form
        onSubmit={handleAddCategory}
        className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"
      >
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Example: Herbal Soaps"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
        />

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-800 px-5 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-50"
        >
          <Plus size={20} />

          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* Categories List */}
      <div className="mt-6 space-y-3">
        {categories.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Tag size={45} className="mx-auto mb-3 text-green-700" />

            <h2 className="font-semibold text-gray-800">
              No categories yet
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add your first product category above.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 text-green-800">
                  <Tag size={20} />
                </div>

                <div>
                  <h3 className="font-medium text-gray-800">
                    {category.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {category.slug}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(category.id)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                title="Delete category"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Categories;