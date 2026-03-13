import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FaLink } from "react-icons/fa6";
import { FiCopy } from "react-icons/fi";

import { LuWallet } from "react-icons/lu";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { BsCart } from "react-icons/bs";
import { CiMedal } from "react-icons/ci";
import { HiOutlineDocumentText } from "react-icons/hi";
import { GoArrowUpRight } from "react-icons/go";
import { requestMemberApi } from "../utils/apiClient";

const ACTIVATION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function readStoredMemberData() {
  try {
    return JSON.parse(localStorage.getItem("memberData") || "{}") || {};
  } catch {
    return {};
  }
}

function resolveStepFromPackageId(packageId) {
  const packageIdText = String(packageId || "").trim();
  const stepMatch = packageIdText.match(/step[-_]?(\d+)/i);

  if (!stepMatch) {
    return 0;
  }

  const step = Number(stepMatch[1]);
  return Number.isFinite(step) && step > 0 ? Math.trunc(step) : 0;
}

function getMemberStep(memberData) {
  const step = Number(
    memberData?.selected_package_step ??
      memberData?.package_step ??
      memberData?.step_level,
  );

  if (Number.isFinite(step) && step > 0) {
    return Math.trunc(step);
  }

  return resolveStepFromPackageId(memberData?.selected_package_id);
}

function isMemberActivated(memberData) {
  const rawStatus = memberData?.status;

  if (typeof rawStatus === "boolean") {
    return rawStatus;
  }

  if (typeof rawStatus === "number") {
    return rawStatus === 1;
  }

  const normalizedStatus = String(rawStatus || "").trim().toLowerCase();
  return ["1", "true", "active", "activated", "approved"].includes(normalizedStatus);
}

function formatActivationCountdown(milliseconds) {
  if (milliseconds <= 0) return "Expired";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function formatCurrencyInr(value) {
  const numericValue = Number(value || 0);

  return `₹${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue)}`;
}

/* ================= CARD ================= */
function Card({ title, amount, note, color, icon }) {
  return (
    <div className={`p-6 rounded-xl text-white shadow ${color}`}>
      <div className="flex justify-between items-start">
        {/* Icon Box */}
        <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl">{icon}</span>
        </div>

        {/* Growth Badge */}
        <span className="text-xs bg-green-200 text-green-700 px-3 py-1 rounded-md font-semibold">
          +2.06%
        </span>
      </div>

      <h3 className="text-lg opacity-90 mt-4">{title}</h3>
      <h2 className="text-4xl font-bold mt-1">{amount}</h2>
      <p className="text-sm opacity-80 mt-1">{note}</p>
    </div>
  );
}

/* ================= DASHBOARD ================= */
export default function Dashboard() {
  const [memberData, setMemberData] = useState(() => readStoredMemberData());

  // welcome name and id
  const welcomeName = memberData.fullname || memberData.user_id || "Member";
  const customerId = memberData.user_id
    ? `MLM-${memberData.user_id}`
    : "MLM-00000";

  const sponsorId = memberData.user_id || memberData.id || "FC7981495";
  const memberUserId = memberData.user_id || "";
  const memberStep = getMemberStep(memberData);
  const hasActiveStep = isMemberActivated(memberData) && memberStep > 0;
  const activationUserKey = memberData.user_id || memberData.id || "guest";
  const activationStorageKey = `memberActivationDeadline30d:${activationUserKey}`;

  const getOrCreateActivationDeadline = () => {
    const now = Date.now();
    const storedDeadline = Number(localStorage.getItem(activationStorageKey));
    const remainingMs = storedDeadline - now;

    if (
      Number.isFinite(storedDeadline) &&
      remainingMs > 0 &&
      remainingMs <= ACTIVATION_WINDOW_MS
    ) {
      return storedDeadline;
    }

    const newDeadline = now + ACTIVATION_WINDOW_MS;
    localStorage.setItem(activationStorageKey, String(newDeadline));
    return newDeadline;
  };

  const [activationCountdown, setActivationCountdown] = useState(() =>
    hasActiveStep ? "Active" : formatActivationCountdown(getOrCreateActivationDeadline() - Date.now()),
  );
  const [dashboardStats, setDashboardStats] = useState({
    purchase_balance: 0,
    turnover_balance: 0,
    purchase_orders: 0,
    sales_orders: 0,
    sales_turnover: 0,
    commission_amount: 0,
  });

  useEffect(() => {
    if (!memberUserId) {
      return undefined;
    }

    let isMounted = true;

    const fetchDashboardSummary = async () => {
      try {
        const response = await requestMemberApi("/member/dashboard", {
          headers: {
            Accept: "application/json",
            "X-Auth-Member": memberUserId,
          },
        });

        if (!response.ok || !isMounted) {
          return;
        }

        setMemberData((previousMemberData) => {
          const nextMemberData = {
            ...previousMemberData,
            selected_package_id:
              response.data?.selected_package_id ?? previousMemberData.selected_package_id,
            selected_package_step:
              response.data?.selected_package_step ?? previousMemberData.selected_package_step,
            package_step: response.data?.package_step ?? previousMemberData.package_step,
            step_level: response.data?.step_level ?? previousMemberData.step_level,
            status: response.data?.status ?? previousMemberData.status,
          };

          localStorage.setItem("memberData", JSON.stringify(nextMemberData));
          return nextMemberData;
        });
      } catch {
        // keep existing values on API/network failure
      }
    };

    fetchDashboardSummary();

    return () => {
      isMounted = false;
    };
  }, [memberUserId]);

  useEffect(() => {
    if (hasActiveStep) {
      setActivationCountdown("Active");
      return undefined;
    }

    const deadline = getOrCreateActivationDeadline();
    let intervalId;

    const tick = () => {
      const remainingMs = deadline - Date.now();
      setActivationCountdown(formatActivationCountdown(remainingMs));

      if (remainingMs <= 0 && intervalId) {
        clearInterval(intervalId);
      }
    };

    tick();
    intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [activationStorageKey, hasActiveStep]);

  useEffect(() => {
    if (!memberUserId) {
      return undefined;
    }

    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        const response = await requestMemberApi("/member/dashboard-stats", {
          headers: {
            Accept: "application/json",
            "X-Auth-Member": memberUserId,
          },
        });

        if (!response.ok || !isMounted) {
          return;
        }

        const data = response.data?.data || {};
        setDashboardStats({
          purchase_balance: Number(data.purchase_balance) || 0,
          turnover_balance: Number(data.turnover_balance) || 0,
          purchase_orders: Number(data.purchase_orders) || 0,
          sales_orders: Number(data.sales_orders) || 0,
          sales_turnover: Number(data.sales_turnover) || 0,
          commission_amount: Number(data.commission_amount) || 0,
        });
      } catch {
        // keep existing values on API/network failure
      }
    };

    fetchDashboardStats();
    const intervalId = setInterval(fetchDashboardStats, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [memberUserId]);

  const baseSignup = `${window.location.origin}/member/signup`;
  const leftLink = `${baseSignup}?sponsorId=${encodeURIComponent(sponsorId)}&position=left`;
  const rightLink = `${baseSignup}?sponsorId=${encodeURIComponent(sponsorId)}&position=right`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Link copied!");
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="p-6">
          

          {/* Welcome */}
          <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow">
            Welcome back, {welcomeName} {customerId && `(${customerId})`}
          </div>


          <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow mt-5 flex items-center justify-between gap-3">
            <span>{hasActiveStep ? `ID Active to ${memberStep} Step` : "ID Must Be Activated Within 30 Days"}</span>
            <span className="font-semibold whitespace-nowrap">{activationCountdown}</span>
          </div>

          {/* Referral Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
            {/* Left */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FaLink className="text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-500 text-sm">Left Referral</p>
                  <p className="text-sm text-gray-700 truncate">{leftLink}</p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(leftLink)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md shrink-0"
              >
                <FiCopy className="text-gray-600" />
              </button>
            </div>

            {/* Right */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FaLink className="text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-500 text-sm">Right Referral</p>
                  <p className="text-sm text-gray-700 truncate">{rightLink}</p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(rightLink)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md shrink-0"
              >
                <FiCopy className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Referral helper: if sponsorId is placeholder, show notice to create initial member */}
          {sponsorId === "FC7981495" && (
            <div className="mt-3 text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
              No main member found in local session. Create one member in the
              backend database with an active status so referrals can use your
              referral links. See backend README for instructions.
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
            {/* Purchase Balance (Wallet Icon) */}
            <Card
              title="Purchase Balance"
              amount={formatCurrencyInr(dashboardStats.purchase_balance)}
              note="Updated vs last month"
              icon={<LuWallet />}
              color="bg-[linear-gradient(90deg,#3483D2,#2262A1)]"
            />

            {/* Turnover */}
            <Card
              title="Turnover Balance"
              amount={formatCurrencyInr(dashboardStats.turnover_balance)}
              note="Growth vs last month"
              icon={<GoArrowUpRight />}
              color="bg-[linear-gradient(90deg,#45B0D7,#268CB1)]"
            />

            {/* Purchase Orders */}
            <Card
              title="Purchase Orders"
              amount={String(dashboardStats.purchase_orders)}
              note="Orders this month"
              icon={<BsCart />}
              color="bg-[linear-gradient(90deg,#2DA5D2,#2874BE)]"
            />

            {/* Sales Orders */}
            <Card
              title="No. of Sales Orders"
              amount={String(dashboardStats.sales_orders)}
              note="Sales this month"
              icon={<HiOutlineDocumentText />}
              color="bg-[linear-gradient(90deg,#B74331,#8A3225)]"
            />

            {/* Sales Turnover */}
            <Card
              title="Sales Turnover Amount"
              amount={formatCurrencyInr(dashboardStats.sales_turnover)}
              note="Revenue this month"
              icon={<FaIndianRupeeSign />}
              color="bg-[linear-gradient(90deg,#2A9EC9,#266DB2)]"
            />

            {/* Commission */}
            <Card
              title="Commission Amount"
              amount={formatCurrencyInr(dashboardStats.commission_amount)}
              note="Earned this month"
              icon={<CiMedal />}
              color="bg-[linear-gradient(90deg,#9B4032,#2864A3)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
