import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import StoreBrand from "../components/StoreBrand";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful! 🎉");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg sm:p-8">

        <StoreBrand />

        <div className="mb-6 text-center">

          <h1 className="text-3xl font-bold text-green-900">
            Welcome Back 🌿
          </h1>

          <p className="mt-2 text-gray-500">
            Login to continue shopping.
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-800 p-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-semibold text-green-700 hover:underline"
          >
            Create an account
          </Link>

        </p>

      </div>
    </div>
  );
}

export default Login;
