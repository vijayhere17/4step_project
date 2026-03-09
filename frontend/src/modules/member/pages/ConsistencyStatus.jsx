import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { IndianRupee } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { requestMemberApi } from "../utils/apiClient";

const EMPTY_DATA = {
  current_balance: 0,
  total_credit: 0,
  total_debit: 0,
  transactions: [],
};

const toNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(toNumber(value));
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const normalizeStatusPayload = (payload) => {
  const rawTransactions = Array.isArray(payload?.transactions)
    ? payload.transactions
    : [];

  const normalizedTransactions = rawTransactions.map((row, index) => {
    return {
      id: row?.id ?? index,
      date: row?.date || null,
      description: row?.description || "-",
      credit_amount: toNumber(row?.credit_amount),
      debit_amount: toNumber(row?.debit_amount),
      balance_after:
        row?.balance_after === null || row?.balance_after === undefined
          ? null
          : toNumber(row?.balance_after),
    };
  });

  const computedCredit = normalizedTransactions.reduce(
    (sum, row) => sum + row.credit_amount,
    0,
  );
  const computedDebit = normalizedTransactions.reduce(
    (sum, row) => sum + row.debit_amount,
    0,
  );

  const latestBalanceWithValue = normalizedTransactions.find(
    (row) => row.balance_after !== null,
  );

  return {
    current_balance:
      payload?.current_balance !== undefined && payload?.current_balance !== null
        ? toNumber(payload.current_balance)
        : latestBalanceWithValue
          ? latestBalanceWithValue.balance_after
          : computedCredit - computedDebit,
    total_credit:
      payload?.total_credit !== undefined && payload?.total_credit !== null
        ? toNumber(payload.total_credit)
        : computedCredit,
    total_debit:
      payload?.total_debit !== undefined && payload?.total_debit !== null
        ? toNumber(payload.total_debit)
        : computedDebit,
    transactions: normalizedTransactions,
  };
};

export default function ConsistencyStatus() {
  const [statusData, setStatusData] = useState(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const memberUserId = useMemo(() => {
    try {
      const member = JSON.parse(localStorage.getItem("memberData") || "{}");
      return member?.user_id || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      if (!memberUserId) {
        if (isMounted) {
          setError("Please sign in first.");
          setStatusData(EMPTY_DATA);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setError("");
        }

        const response = await requestMemberApi("/member/consistency-status?limit=200", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Auth-Member": memberUserId,
          },
        });

        if (!response.ok) {
          throw new Error(response.data?.message || "Unable to fetch consistency status data.");
        }

        if (isMounted) {
          setStatusData(normalizeStatusPayload(response.data?.data));
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Unable to fetch consistency status data.");
          setStatusData(EMPTY_DATA);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [memberUserId]);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        {/* Page Title */}
        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-[#B0422E]">
            Consistency Status
          </h1>
        </div>

        {isLoading && <p className="text-center text-gray-500 mt-4">Loading status...</p>}
        {!isLoading && error && <p className="text-center text-red-500 mt-4">{error}</p>}

        <div className="p-6 space-y-6">
          {/* Top Balance Card */}
          <div className="bg-[#B0422E] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl">
                <IndianRupee size={28} />
              </div>
              <div>
                <p className="uppercase text-sm tracking-wide font-semibold text-[#FFFFFF]">
                  Consistency Balance
                </p>
                <h2 className="text-3xl font-bold">{formatCurrency(statusData.current_balance)}</h2>
              </div>
            </div>

            {/* Credit / Debit Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[#CF9D94A1] rounded-xl p-6">
                <p className="uppercase text-semibold text-[#FFFFFFAD]">Total Credit</p>
                <h3 className="text-2xl font-bold mt-2">{formatCurrency(statusData.total_credit)}</h3>
              </div>

              <div className="bg-[#CF9D94A1] rounded-xl p-6">
                <p className="uppercase text-semibold text-[#FFFFFFAD]">Total Debit</p>
                <h3 className="text-2xl font-bold mt-2">{formatCurrency(statusData.total_debit)}</h3>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="bg-[#B0422E] text-white">
                  <th className="py-3 px-4 text-left rounded-l-xl">
                    Sr No
                  </th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Detail</th>
                  <th className="py-3 px-4 text-left">
                    Credit Amount
                  </th>
                  <th className="py-3 px-4 text-left">
                    Debit Amount
                  </th>
                  <th className="py-3 px-4 text-left rounded-r-xl">
                    Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                {!isLoading && statusData.transactions.length === 0 && (
                  <tr className="border-b">
                    <td className="py-4 px-4" colSpan={6}>No consistency transactions found</td>
                  </tr>
                )}

                {statusData.transactions.map((row, index) => (
                  <tr className="border-b" key={row.id ?? index}>
                    <td className="py-4 px-4">{String(index + 1).padStart(2, "0")}</td>
                    <td className="py-4 px-4">{formatDate(row.date)}</td>
                    <td className="py-4 px-4">{row.description || "-"}</td>
                    <td className="py-4 px-4">
                      {row.credit_amount > 0 ? formatCurrency(row.credit_amount) : "--"}
                    </td>
                    <td className="py-4 px-4">
                      {row.debit_amount > 0 ? formatCurrency(row.debit_amount) : "--"}
                    </td>
                    <td className="py-4 px-4">
                      {row.balance_after === null ? "--" : formatCurrency(row.balance_after)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}