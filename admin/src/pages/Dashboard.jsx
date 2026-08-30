import { useNavigate } from "react-router-dom";
import {
  Package,
  PlusCircle,
  Tags,
  ShoppingBag,
  Camera,
  Settings,
  CreditCard,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Products",
      description: "View and manage products",
      path: "/products",
      icon: <Package size={28} />,
    },
    {
      name: "Add Product",
      description: "Add a new product",
      path: "/products/add",
      icon: <PlusCircle size={28} />,
    },
    {
      name: "Categories",
      description: "Manage product categories",
      path: "/categories",
      icon: <Tags size={28} />,
    },
    {
      name: "Orders",
      description: "View customer orders",
      path: "/orders",
      icon: <ShoppingBag size={28} />,
    },
    {
    name: "Payment History",
    description: "View payments and refunds",
    path: "/payment-history",
    icon: <CreditCard size={28} />,
  },
    {
      name: "Instagram",
      description: "Manage Instagram content",
      path: "/instagram",
      icon: <Camera size={28} />,
    },
    {
      name: "Settings",
      description: "Manage store settings",
      path: "/settings",
      icon: <Settings size={28} />,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-900 md:text-3xl">
          Welcome to Admin Panel 👋
        </h1>

        <p className="mt-2 text-sm text-gray-500 md:text-base">
          Manage your Ayurvedic Beauty Store from one place.
        </p>
      </div>

      {/* Dashboard Options */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-3 rounded-full bg-green-100 p-3 text-green-800">
              {item.icon}
            </div>

            <h2 className="font-semibold text-gray-800">
              {item.name}
            </h2>

            <p className="mt-1 hidden text-xs text-gray-500 sm:block">
              {item.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
