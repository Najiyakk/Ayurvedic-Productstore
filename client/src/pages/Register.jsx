import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import StoreBrand from "../components/StoreBrand";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }

    setError("");

    // Remove extra spaces
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Basic validation
    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (signUpError) {
        console.error("Registration error:", signUpError);
        
        let errorMessage = signUpError.message || "Registration failed. Please try again.";
        
        // Better error messages for common issues
        if (errorMessage.includes("rate limit")) {
          errorMessage = "Too many registration attempts. Please wait 15-30 minutes before trying again.";
        } else if (errorMessage.includes("already registered")) {
          errorMessage = "This email is already registered. Please login or use a different email.";
        } else if (errorMessage.includes("invalid")) {
          errorMessage = "Invalid email address. Please check and try again.";
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      console.log("Registered user:", data);
      setError("");
      alert("Registration successful! 🎉");
      navigate("/login");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <StoreBrand />

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-900">
            Create Account 🌿
          </h1>

          <p className="mt-2 text-gray-500">
            Join our Ayurvedic beauty community.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              minLength="6"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-green-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-800 p-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-green-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

