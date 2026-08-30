
import { useEffect, useState } from "react";
import { Play, Camera } from "lucide-react";
import { supabase } from "../lib/supabase";

function ProductVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("product_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching product videos:", error);
        setVideos([]);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    };

    fetchVideos();
  }, []);

  return (
    <section id="videos" className="bg-green-50 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-medium text-green-700">WATCH OUR PRODUCTS</p>

          <h2 className="mt-2 text-3xl font-bold text-green-950">
            Product Videos
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            See our natural Ayurvedic products in action.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 text-center text-gray-500">
            Loading product videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-12 text-center text-gray-500">
            No product videos available yet.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-green-100">
                  <img
                    src={video.thumbnail_url}
                    alt={video.product_name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-green-800 shadow-lg transition duration-300 group-hover:scale-110">
                      <Play size={30} fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="p-5 text-center">
                  <h3 className="text-lg font-bold text-green-950">
                    {video.product_name}
                  </h3>

                  <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-green-700">
                    <Camera size={18} />
                    Watch on Instagram
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductVideos;

