import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Upload,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Settings() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [settingsId, setSettingsId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [formData, setFormData] = useState({
    store_name: "",
    phone: "",
    upi_id: "",
    email: "",
    address: "",
    instagram_url: "",
    logo_url: "",
  });

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(error);
        alert(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setSettingsId(data.id);

        setFormData({
          store_name: data.store_name || "",
          phone: data.phone || "",
          upi_id: data.upi_id || "",
          email: data.email || "",
          address: data.address || "",
          instagram_url: data.instagram_url || "",
          logo_url: data.logo_url || "",
        });
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  // Handle normal input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Select logo from computer
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Logo image must be smaller than 5 MB.");
      return;
    }

    setLogoFile(file);

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      logo_url: previewUrl,
    }));
  };

  // Upload logo to Supabase Storage
  const uploadLogo = async () => {
    // No new logo selected → keep existing logo
    if (!logoFile) {
      return formData.logo_url;
    }

    setUploadingLogo(true);

    const fileExt = logoFile.name.split(".").pop();

    const fileName = `logos/logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, logoFile);

    setUploadingLogo(false);

    if (uploadError) {
      console.error(uploadError);
      alert("Logo upload failed: " + uploadError.message);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Save settings
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    // Upload logo first
    const logoUrl = await uploadLogo();

    if (logoUrl === null) {
      setSaving(false);
      return;
    }

    const settingsData = {
      store_name: formData.store_name,
      phone: formData.phone,
      upi_id: formData.upi_id,
      email: formData.email,
      address: formData.address,
      instagram_url: formData.instagram_url,
      logo_url: logoUrl,
    };

    let error;

    // Update existing settings
    if (settingsId) {
      const result = await supabase
        .from("company_settings")
        .update({
          ...settingsData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settingsId);

      error = result.error;
    } else {
      // Insert settings for first time
      const result = await supabase
        .from("company_settings")
        .insert(settingsData)
        .select()
        .single();

      error = result.error;

      if (result.data) {
        setSettingsId(result.data.id);
      }
    }

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // Save actual Supabase URL in state
    setFormData((prev) => ({
      ...prev,
      logo_url: logoUrl,
    }));

    // Clear selected file
    setLogoFile(null);

    alert("Settings saved successfully! 🎉");
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="rounded-2xl bg-white p-5 shadow-sm md:p-8">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-green-900">
            <Store size={28} />
            Store Settings
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your store information and contact details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Store Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Store Name
            </label>

            <input
              type="text"
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
              placeholder="Ayurveda Store"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Phone size={16} />
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* UPI ID */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              UPI ID
            </label>

            <input
              type="text"
              name="upi_id"
              value={formData.upi_id}
              onChange={handleChange}
              placeholder="yourname@upi"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />

            <p className="mt-1 text-xs text-gray-400">
              This is the UPI id used for customer payments.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Mail size={16} />
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="store@example.com"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium">
              <MapPin size={16} />
              Store Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your store address"
              rows="4"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Instagram URL
            </label>

            <input
              type="url"
              name="instagram_url"
              value={formData.instagram_url}
              onChange={handleChange}
              placeholder="https://www.instagram.com/yourstore"
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Store Logo */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Store Logo
            </label>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-5 text-green-800 transition hover:bg-green-100">
              <Upload size={20} />

              <span>
                {logoFile
                  ? logoFile.name
                  : "Choose Logo Image"}
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-gray-400">
              Upload PNG, JPG, JPEG, or WEBP. Maximum size: 5 MB.
            </p>

            {/* Logo Preview */}
            {formData.logo_url && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-500">
                  Logo Preview
                </p>

                <img
                  src={formData.logo_url}
                  alt="Store logo preview"
                  className="h-28 w-28 rounded-xl border bg-white object-contain p-2"
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving || uploadingLogo}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 p-3 font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={20} />

            {saving || uploadingLogo
              ? "Saving..."
              : "Save Settings"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Settings;