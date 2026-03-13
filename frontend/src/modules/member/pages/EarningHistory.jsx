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

const EarningBalanceHistory = () => {
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
            setError("Please sign in to view earning balance history.");
          }
          return;
        }

        const response = await requestMemberApi("/member/earning-balance-history", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Auth-Member": memberData.user_id,
          },
        });

        if (!response.ok) {
          throw new Error(response.data?.message || "Unable to load earning balance history.");
        }

        if (isMounted) {
          setRows(Array.isArray(response.data?.data) ? response.data.data : []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setRows([]);
          setError(fetchError.message || "Unable to load earning balance history.");
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
             Earning Balance History
            </h1>

            {isLoading && <p className="text-center text-gray-500 mb-4">Loading history...</p>}
            {!isLoading && error && <p className="text-center text-red-500 mb-4">{error}</p>}

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-center">

                                    <thead>
                                    <tr className="bg-[#B0422E] text-white">
                                    <th className="p-3 rounded-l-xl">Sr No</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Credit (₹)</th>
                                    <th className="p-3">Debit (₹)</th>
                                    <th className="p-3">Balance (₹)</th>
                                    <th className="p-3 rounded-r-xl">Status</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {!isLoading && rows.length === 0 && (
                                      <tr className="border-b">
                                        <td className="p-4" colSpan={7}>No earning balance history records found</td>
                                      </tr>
                                    )}

                                    {rows.map((row, index) => (
                                      <tr className="border-b" key={`${row.date || ""}-${row.description || ""}-${index}`}>
                                        <td className="p-4">{String(row.sr_no || index + 1).padStart(2, "0")}</td>
                                        <td>{row.date || "-"}</td>
                                        <td>{row.description || "-"}</td>
                                        <td>{Number(row.credit_amount) > 0 ? formatMoney(row.credit_amount) : "--"}</td>
                                        <td>{Number(row.debit_amount) > 0 ? formatMoney(row.debit_amount) : "--"}</td>
                                        <td>{formatMoney(row.balance_amount)}</td>
                                        <td className={`font-semibold ${String(row.status || "").toLowerCase() === "approved" ? "text-green-600" : "text-yellow-600"}`}>
                                          {row.status || "Pending"}
                                        </td>
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

export default EarningBalanceHistory;
