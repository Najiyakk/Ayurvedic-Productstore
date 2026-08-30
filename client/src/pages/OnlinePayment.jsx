
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  Copy,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function OnlinePayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive order details from Checkout.jsx
  const order = location.state?.order;
  const product = location.state?.product;
  const quantity = location.state?.quantity;
  const [paymentApp, setPaymentApp] = useState("Google Pay");
  const [settings, setSettings] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [proofError, setProofError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .maybeSingle();

      if (!error) {
        setSettings(data);
      }
    };

    fetchSettings();
  }, []);

  const upiId = settings?.upi_id || "gpaynaji@okicici";
  const storeName = settings?.store_name || "Havva Organics";

  // If someone opens this page directly
  if (!order || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 px-4">
        <ShoppingBag size={55} className="text-green-700" />

        <h1 className="mt-4 text-2xl font-bold text-green-900">
          No Order Found
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Please place an order before proceeding to payment.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const total = Number(order.total);
  const upiLink =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(storeName)}` +
    `&am=${encodeURIComponent(total.toFixed(2))}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(`Order #${order.id}`)}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}`;

  const copyUPIId = async () => {
    await navigator.clipboard.writeText(upiId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleUPIPayment = () => {
    window.open(upiLink, "_blank", "noopener,noreferrer");
  };

  const handleProofSubmit = async (event) => {
    event.preventDefault();

    if (!paymentScreenshot) {
      setProofError("Please choose your payment screenshot first.");
      return;
    }

    setSubmittingProof(true);
    setProofError("");

    try {
      const fileExtension = paymentScreenshot.name.split(".").pop();
      const filePath = `${order.id}/${crypto.randomUUID()}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, paymentScreenshot, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      const { data: proofData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          payment_proof_url: proofData.publicUrl,
          payment_status: "pending",
        })
        .eq("id", order.id);

      if (orderError) {
        throw orderError;
      }


      setProofSubmitted(true);
      window.setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (error) {
      setProofError(error.message || "Could not submit payment proof.");
    } finally {
      setSubmittingProof(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-800">
              <CreditCard size={30} />
            </div>

            <h1 className="mt-4 text-3xl font-bold text-green-900">
              Complete Your Payment
            </h1>

            <p className="mt-2 text-gray-500">
              Choose Google Pay, PhonePe, Paytm, BHIM, or another UPI app.
            </p>
          </div>

          {/* Payment App Selection */}
          <div className="mt-6 rounded-2xl border border-green-100 bg-white p-5">
            <label
              htmlFor="payment-app"
              className="block text-sm font-semibold text-green-900"
            >
              Select your payment app
            </label>

            <select
              id="payment-app"
              value={paymentApp}
              onChange={(event) => setPaymentApp(event.target.value)}
              className="mt-2 w-full rounded-xl border border-green-200 bg-white p-3 text-gray-800 outline-none focus:border-green-600"
            >
              <option>Google Pay</option>
              <option>PhonePe</option>
              <option>Paytm</option>
              <option>BHIM UPI</option>
              <option>Any other UPI app</option>
            </select>

            <p className="mt-2 text-sm text-gray-500">
              On mobile, the selected app or your available UPI app will open.
            </p>
          </div>

          {/* Laptop Payment Option */}
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-green-300 bg-green-50 p-5 text-center">
            <h2 className="font-bold text-green-900">
              Paying from a laptop?
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Scan this QR code with {paymentApp} or any UPI app on your phone.
            </p>

            <img
              src={qrCodeUrl}
              alt="UPI payment QR code"
              className="mt-4 h-48 w-48 rounded-lg bg-white p-2"
            />

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
              <span>{upiId}</span>
              <button
                type="button"
                onClick={copyUPIId}
                className="rounded p-1 text-green-700 hover:bg-green-100"
                title="Copy UPI ID"
                aria-label="Copy UPI ID"
              >
                <Copy size={16} />
              </button>
            </div>

            {copied && (
              <p className="mt-2 text-xs font-medium text-green-700">
                UPI ID copied
              </p>
            )}
          </div>

          {/* Product Details */}
          <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-5">
            <h2 className="font-bold text-green-900">
              Order Details
            </h2>

            <div className="mt-4 flex gap-4">

              {/* Product Image */}
              <div className="h-20 w-20 overflow-hidden rounded-xl bg-white">

                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="text-green-700" />
                  </div>
                )}

              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {product.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {quantity}
                </p>

                <p className="mt-1 font-semibold text-green-700">
                  ₹{product.price}
                </p>
              </div>

            </div>

            {/* Total */}
            <div className="mt-5 flex items-center justify-between border-t border-green-200 pt-5">

              <span className="text-lg font-semibold text-gray-700">
                Total Amount
              </span>

              <span className="text-2xl font-bold text-green-900">
                ₹{total.toFixed(2)}
              </span>

            </div>

          </div>

          {/* Payment Information */}
          <div className="mt-6 rounded-xl bg-yellow-50 p-5">

            <div className="flex gap-3">

              <CheckCircle
                size={22}
                className="mt-0.5 shrink-0 text-yellow-700"
              />

              <div>
                <h3 className="font-semibold text-yellow-800">
                  Ready to Pay
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-yellow-700">
                  When you click the button below, your UPI payment app will
                  open with the store's payment details and ₹{total.toFixed(2)}
                  already filled.
                </p>
              </div>

            </div>

          </div>

          {/* Pay Button */}
          <button
            onClick={handleUPIPayment}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-green-900"
          >
            <CreditCard size={22} />

            Pay ₹{total.toFixed(2)} via UPI
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Mobile users can open {paymentApp}; laptop users can scan the QR code.
          </p>

          {/* Payment Proof */}
          <form
            onSubmit={handleProofSubmit}
            className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5"
          >
            <h2 className="font-bold text-green-900">
              After you pay
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Return to this page without closing it, upload your payment screenshot,
              and submit it. Your payment will stay pending until the admin verifies it.
            </p>

            <label
              htmlFor="payment-screenshot"
              className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-green-400 bg-white px-4 py-4 text-sm font-semibold text-green-800 hover:bg-green-50"
            >
              <Upload size={18} />
              {paymentScreenshot ? paymentScreenshot.name : "Choose payment screenshot"}
            </label>
            <input
              id="payment-screenshot"
              type="file"
              accept="image/*"
              onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)}
              className="sr-only"
            />

            {proofError && (
              <p className="mt-3 text-sm font-medium text-red-700">{proofError}</p>
            )}

            <button
              type="submit"
              disabled={submittingProof || proofSubmitted}
              className="mt-4 w-full rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {proofSubmitted
                ? "Payment proof submitted"
                : submittingProof
                  ? "Submitting..."
                  : "Submit payment screenshot"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default OnlinePayment;

