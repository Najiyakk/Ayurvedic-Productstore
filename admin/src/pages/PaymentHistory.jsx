import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { supabase } from "../lib/supabase";

function PaymentHistory() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        total,
        payment_method,
        payment_status,
        status,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setPayments(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl">

      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-green-900 md:text-3xl">
          <CreditCard size={30} />
          Payment History
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View all customer payments and payment statuses.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500">
          Loading payment history...
        </p>
      )}

      {/* No Payments */}
      {!loading && payments.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <CreditCard
            size={50}
            className="mx-auto mb-4 text-green-700"
          />

          <h2 className="text-lg font-semibold">
            No payment history available
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Payments will appear here when customers place orders.
          </p>
        </div>
      )}

      {/* Payment Table */}
      {!loading && payments.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">

          <table className="min-w-[720px] w-full">

            <thead className="border-b bg-green-50 text-left">
              <tr>
                <th className="p-4 text-sm font-semibold">
                  Customer
                </th>

                <th className="p-4 text-sm font-semibold">
                  Amount
                </th>

                <th className="p-4 text-sm font-semibold">
                  Payment Method
                </th>

                <th className="p-4 text-sm font-semibold">
                  Payment Status
                </th>

                <th className="p-4 text-sm font-semibold">
                  Order Status
                </th>

                <th className="p-4 text-sm font-semibold">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {payment.customer_name}
                  </td>

                  <td className="p-4 font-semibold text-green-800">
                    ₹{payment.total}
                  </td>

                  <td className="p-4 capitalize">
                    {payment.payment_method === "cod"
                      ? "Cash on Delivery"
                      : payment.payment_method || "Online"}
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                      {payment.payment_status || "Pending"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="capitalize">
                      {payment.status}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    {payment.created_at
                      ? new Date(
                          payment.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}
    </div>
  );
}

export default PaymentHistory;
