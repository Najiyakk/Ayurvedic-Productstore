
import { useEffect, useRef, useState } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Leaf,
  Package,
  Phone,
  Mail,
  MapPin,
  Camera,
  LogOut,
  ClipboardList,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "../lib/supabase";
import ProductVideos from "../components/ProductVideos";
import butterfly from "../assets/butterfly.svg";

function Home() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayurveda-cart")) || [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayurveda-wishlist")) || [];
    } catch {
      return [];
    }
  });
  const productsCarouselRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (mounted) {
        setUser(data.session?.user || null);
      }
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
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
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Fetch company settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching company settings:", error);
      } else {
        setSettings(data);
      }

      setSettingsLoading(false);
    };

    fetchSettings();
  }, []);

  // Add to Cart
  const handleAddToCart = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("ayurveda-cart") || "[]");
    const existingItem = existingCart.find((item) => item.id === product.id);
    const updatedCart = existingItem
      ? existingCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...existingCart, { ...product, quantity: 1 }];

    localStorage.setItem("ayurveda-cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    alert(`${product.name} added to cart!`);
  };

  const handleWishlist = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isSaved = wishlist.some((item) => item.id === product.id);
    const updatedWishlist = isSaved
      ? wishlist.filter((item) => item.id !== product.id)
      : [...wishlist, product];

    localStorage.setItem("ayurveda-wishlist", JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  // Buy Now
  const handleBuyNow = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        product: product,
      },
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    }
  };

  // Scroll to section
  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollProducts = (direction) => {
    const carousel = productsCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  const brandName = settings?.store_name || "Ayurvedic Beauty";

  return (
    <div className="min-h-screen bg-[#f8faf5]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">

          {/* Logo - always visible in the header */}
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={brandName}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="rounded-full bg-green-100 p-3 text-green-800">
                <Leaf size={24} />
              </div>
            )}

            <h1 className="max-w-24 truncate text-base font-bold text-green-900 sm:max-w-none sm:text-xl">
              {settingsLoading ? "Loading..." : brandName}
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">

            <button
              onClick={() => scrollToSection("home")}
              className="font-medium text-green-800 hover:text-green-600"
            >
              Home
            </button>

            <button
              onClick={() => scrollToSection("products")}
              className="font-medium text-gray-600 hover:text-green-600"
            >
              Products
            </button>

            <button
              onClick={() => scrollToSection("videos")}
              className="font-medium text-gray-600 hover:text-green-600"
            >
              Videos
            </button>

            <button
              onClick={() => scrollToSection("about")}
              className="font-medium text-gray-600 hover:text-green-600"
            >
              About
            </button>

            <button
              onClick={() => scrollToSection("contact")}
              className="font-medium text-gray-600 hover:text-green-600"
            >
              Contact
            </button>

          </div>

          {/* Login, Register and Cart */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">

            {user ? (
              <button
                onClick={handleLogout}
                className="nav-symbol nav-logout"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-lg px-4 py-2 font-medium text-green-800 hover:bg-green-50 sm:block"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="hidden rounded-lg bg-green-800 px-4 py-2 font-medium text-white hover:bg-green-900 sm:block"
                >
                  Register
                </Link>
              </>
            )}

            {user && (
              <>
                <Link
                  to="/orders"
                  className="nav-symbol nav-orders"
                  title="My orders"
                  aria-label="My orders"
                >
                  <ClipboardList size={21} strokeWidth={2.2} />
                </Link>

                <Link
                  to="/cart"
                  className="nav-symbol nav-cart"
                  title="Shopping cart"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart size={21} strokeWidth={2.2} />

                  <span className="nav-badge nav-badge-cart">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </Link>

                <Link
                  to="/wishlist"
                  className="nav-symbol nav-wishlist"
                  title="My wishlist"
                  aria-label="My wishlist"
                >
                  <Heart size={21} strokeWidth={2.2} />
                  {wishlist.length > 0 && (
                    <span className="nav-badge nav-badge-wishlist">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              </>
            )}

          </div>
        </div>

        <div className="border-t border-green-100 md:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-sm whitespace-nowrap sm:px-6">
            {[
              ["Home", "home"],
              ["Products", "products"],
              ["Videos", "videos"],
              ["About", "about"],
              ["Contact", "contact"],
            ].map(([label, section]) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="rounded-lg px-3 py-2 font-medium text-green-800 hover:bg-green-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-green-100 via-[#f8faf5] to-green-50"
      >
        <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:min-h-[600px] md:grid-cols-2 md:py-16">

          {/* Left Content */}
          <div>

            {user && (
              <p className="mb-5 text-lg font-semibold text-green-800 welcome-message">
                HI {userName}
              </p>
            )}

            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-200 px-4 py-2 text-sm font-medium text-green-800">
              <Leaf size={16} />
              Natural • Pure • Ayurvedic
            </div>

            <h2 className="text-4xl font-bold leading-tight text-green-950 sm:text-5xl md:text-6xl">
              Naturally Beautiful.
              <br />

              <span className="text-green-700">
                Naturally You.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Discover the goodness of Ayurveda with carefully crafted
              natural beauty products made to nourish your skin and hair.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={() => scrollToSection("products")}
                className="flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-green-900"
              >
                <ShoppingBag size={20} />
                Shop Now
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="rounded-xl border border-green-700 px-6 py-3 font-semibold text-green-800 transition hover:bg-green-50"
              >
                Explore Ayurveda
              </button>

            </div>

            {/* Features */}
            <div className="mt-10 flex gap-8 text-sm">

              <div>
                <p className="text-2xl font-bold text-green-800">
                  100%
                </p>

                <p className="text-gray-500">
                  Natural
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-green-800">
                  Ayurvedic
                </p>

                <p className="text-gray-500">
                  Ingredients
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-green-800">
                  ❤️
                </p>

                <p className="text-gray-500">
                  Made with care
                </p>
              </div>

            </div>
          </div>

          {/* Right Side */}
          <div className="relative flex items-center justify-center">

            <motion.div
              className="butterfly-flight"
              aria-label={user ? `HI ${userName}` : "Flying butterfly"}
              initial={false}
              animate={
                prefersReducedMotion
                  ? { opacity: 1, x: 0, y: -20, rotate: 8, scale: 0.52 }
                  : {
                      opacity: [0, 1, 1, 1, 1],
                      x: [-180, -35, 95, 35, -95, 70, 0],
                      y: [-170, -90, -20, 80, 35, -45, -20],
                      rotate: [-24, -5, 17, -12, -22, 19, 8],
                      scale: [0.44, 0.57, 0.67, 0.54, 0.61, 0.69, 0.62],
                    }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 11,
                      delay: 0.2,
                      ease: "easeInOut",
                      times: [0, 0.13, 0.29, 0.48, 0.66, 0.84, 1],
                      repeat: Infinity,
                      repeatDelay: 0.6,
                    }
              }
            >
              <img
                src={butterfly}
                alt=""
                aria-hidden="true"
                className="butterfly-flight-image"
              />

              {user && (
                <span className="butterfly-greeting">
                  HI {userName}
                </span>
              )}
            </motion.div>

            <div className="flex h-80 w-80 items-center justify-center overflow-hidden rounded-full bg-green-200 shadow-xl md:h-[430px] md:w-[430px]">

              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name || "Store"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center">

                  <Leaf
                    size={100}
                    className="mx-auto text-green-700"
                  />

                  <p className="mt-4 text-xl font-semibold text-green-900">
                    Pure Ayurvedic Care
                  </p>

                  <p className="mt-2 px-10 text-sm text-green-700">
                    Nature's goodness for your everyday beauty routine.
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20"
      >

        <div className="text-center">

          <p className="font-medium text-green-700">
            OUR COLLECTION
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-950">
            Discover Our Products
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Explore our collection of natural and Ayurvedic beauty products.
          </p>

        </div>

        {loading && (
          <p className="mt-12 text-center text-gray-500">
            Loading products...
          </p>
        )}

        {!loading && products.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-green-200 bg-green-50 p-10 text-center">

            <Package
              size={45}
              className="mx-auto text-green-700"
            />

            <p className="mt-4 text-gray-600">
              No products available yet.
            </p>

          </div>
        )}

        {!loading && products.length > 0 && (
          <>
          <div className="mt-8 flex items-center justify-end gap-2 sm:mt-10">
            <button
              type="button"
              onClick={() => scrollProducts(-1)}
              aria-label="Show previous products"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-green-200 bg-white text-green-800 shadow-sm transition hover:bg-green-50"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => scrollProducts(1)}
              aria-label="Show next products"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-green-200 bg-white text-green-800 shadow-sm transition hover:bg-green-50"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div
            ref={productsCarouselRef}
            className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:thin]"
          >

            {products.map((product) => (

              <div
                key={product.id}
                className="w-[82vw] max-w-sm shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-[calc(50%-0.625rem)] lg:w-[calc((100%-2.5rem)/3)]"
              >

                {/* Product Image */}
                <div className="relative h-64 bg-green-50">

                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package
                        size={55}
                        className="text-green-700"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => handleWishlist(product)}
                    className={`absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition hover:scale-105 ${wishlist.some((item) => item.id === product.id) ? "text-pink-600" : "text-gray-500"}`}
                    title={wishlist.some((item) => item.id === product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    aria-label={wishlist.some((item) => item.id === product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={20} fill={wishlist.some((item) => item.id === product.id) ? "currentColor" : "none"} />
                  </button>

                </div>

                {/* Product Details */}
                <div className="p-5">

                  <p className="text-xs font-medium text-green-700">
                    {product.categories?.name || "Ayurvedic Product"}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-green-950">
                    {product.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {product.description ||
                      "Natural Ayurvedic beauty product."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">

                    <p className="text-xl font-bold text-green-800">
                      ₹{product.price}
                    </p>

                    {product.stock > 0 ? (
                      <span className="text-sm font-medium text-green-600">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-red-500">
                        Out of Stock
                      </span>
                    )}

                  </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock <= 0}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <ShoppingBag size={19} />
                      Buy Now
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-3 font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <ShoppingCart size={19} />
                      Add to Cart
                    </button>

                  </div>

                </div>
              </div>

            ))}

          </div>
          </>
        )}

      </section>

      {/* Product Videos Section */}
      <ProductVideos />

      {/* About Section */}
      <section
        id="about"
        className="bg-green-100 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-4xl text-center">

          <Leaf
            size={45}
            className="mx-auto text-green-700"
          />

          <h2 className="mt-4 text-3xl font-bold text-green-950">
            The Goodness of Ayurveda
          </h2>

          <p className="mt-5 leading-relaxed text-gray-600">
            We believe in natural beauty and the traditional wisdom of Ayurveda.
            Our products are carefully selected to help you take care of your
            skin and hair naturally.
          </p>

        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="bg-green-900 px-4 py-14 text-white sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="font-medium text-green-300">
              GET IN TOUCH
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Contact {settings?.store_name || "Us"}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-green-100">
              Have questions about our products? We'd love to hear from you.
            </p>

          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Phone */}
            <div className="rounded-2xl bg-white/10 p-6">
              <Phone className="text-green-300" size={28} />

              <h3 className="mt-4 text-lg font-semibold">
                Phone
              </h3>

              {settings?.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="mt-2 block text-green-100 hover:text-white"
                >
                  {settings.phone}
                </a>
              ) : (
                <p className="mt-2 text-green-100">
                  Loading...
                </p>
              )}
            </div>

            {/* Email */}
            <div className="rounded-2xl bg-white/10 p-6">
              <Mail className="text-green-300" size={28} />

              <h3 className="mt-4 text-lg font-semibold">
                Email
              </h3>

              {settings?.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-2 block break-all text-green-100 hover:text-white"
                >
                  {settings.email}
                </a>
              ) : (
                <p className="mt-2 text-green-100">
                  Loading...
                </p>
              )}
            </div>

            {/* Address */}
            <div className="rounded-2xl bg-white/10 p-6">
              <MapPin className="text-green-300" size={28} />

              <h3 className="mt-4 text-lg font-semibold">
                Address
              </h3>

              <p className="mt-2 text-green-100">
                {settings?.address || "Loading..."}
              </p>
            </div>

            {/* Instagram */}
            <div className="rounded-2xl bg-white/10 p-6">
              <Camera className="text-green-300" size={28} />

              <h3 className="mt-4 text-lg font-semibold">
                Follow Us
              </h3>

              {settings?.instagram_url ? (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-green-100 hover:text-white"
                >
                  Instagram
                </a>
              ) : (
                <p className="mt-2 text-green-100">
                  Not available
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 px-4 py-6 text-center text-sm text-green-200 sm:px-6">
        © {new Date().getFullYear()}{" "}
        {settings?.store_name || "Ayurvedic Beauty"}.
        All rights reserved.
      </footer>

    </div>
  );
}

export default Home;
