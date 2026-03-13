import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import React, { useEffect, useState } from "react";
import { requestMemberApi } from "../utils/apiClient";

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `₹${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

const EarningBalanceWithdrawal = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchRows = async () => {
      try {
        setError("");

        let memberData = {};
        try {
          memberData = JSON.parse(localStorage.getItem("memberData") || "{}") || {};
        } catch {
          memberData = {};
        }

        if (!memberData?.user_id) {
          if (isMounted) {
            setRows([]);
            setError("Please sign in to view earning balance withdrawal.");
          }
          return;
        }

        const response = await requestMemberApi("/member/earning-balance-withdrawal", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Auth-Member": memberData.user_id,
          },
        });

        if (!response.ok) {
          throw new Error(response.data?.message || "Unable to load earning balance withdrawal.");
        }

        if (isMounted) {
          setRows(Array.isArray(response.data?.data) ? response.data.data : []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setRows([]);
          setError(fetchError.message || "Unable to load earning balance withdrawal.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRows();
    const intervalId = setInterval(fetchRows, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
          <Sidebar />
    
          <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
            <Navbar />
            <div className="p-4 sm:p-6 bg-gray-100">

            <h1 className="text-3xl font-bold text-[#B0422E] text-center mb-8">
             Earning Balance Withdrawal
            </h1>

            {isLoading && <p className="text-center text-gray-500 mb-4">Loading withdrawals...</p>}
            {!isLoading && error && <p className="text-center text-red-500 mb-4">{error}</p>}

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-center">

                                    <thead>
                                    <tr className="bg-[#B0422E] text-white">
                                    <th className="p-3 rounded-l-xl">Sr No</th>
                                    <th className="p-3">Payment Date</th>
                                    <th className="p-3">Payment Amount</th>
                                    <th className="p-3">Reference No.</th>
                                    <th className="p-3 rounded-r-xl">Status</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {!isLoading && rows.length === 0 && (
                                      <tr className="border-b">
                                        <td className="p-4" colSpan={5}>No earning balance withdrawal records found</td>
                                      </tr>
                                    )}

                                    {rows.map((row, index) => (
                                      <tr className="border-b" key={`${row.payment_date || ""}-${row.reference_no || ""}-${index}`}>
                                        <td className="p-4">{String(row.sr_no || index + 1).padStart(2, "0")}</td>
                                        <td>{row.payment_date || "-"}</td>
                                        <td>{formatMoney(row.payment_amount)}</td>
                                        <td>{row.reference_no || "-"}</td>
                                        <td>{row.status || "Pending"}</td>
                                      </tr>
                                    ))}
                             </tbody>

                        </table>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default EarningBalanceWithdrawal;
