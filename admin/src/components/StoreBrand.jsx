import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { supabase } from "../lib/supabase";

function StoreBrand() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      const { data } = await supabase
        .from("company_settings")
        .select("logo_url, store_name")
        .maybeSingle();

      if (mounted) {
        setSettings(data);
      }
    };

    fetchSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mb-6 flex items-center justify-center gap-3">
      {settings?.logo_url ? (
        <img
          src={settings.logo_url}
          alt={settings.store_name || "Store Logo"}
          className="h-14 w-14 rounded-full object-cover"
        />
      ) : (
        <div className="rounded-full bg-green-100 p-3 text-green-800">
          <Leaf size={24} />
        </div>
      )}
      <span className="text-xl font-bold text-green-900">
        {settings?.store_name || "Ayurvedic Beauty"}
      </span>
    </div>
  );
}

export default StoreBrand;
