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
    return JSON.parse(localStorage.getItem("memberData") || "{}");
  } catch {
    return {};
  }
}

function resolveStepFromPackageId(id) {
  const match = String(id || "").match(/step[-_]?(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function getMemberStep(member) {
  const step =
    member?.selected_package_step ??
    member?.package_step ??
    member?.step_level;

  return step ? Number(step) : resolveStepFromPackageId(member?.selected_package_id);
}

function isMemberActivated(member) {
  const status = String(member?.status || "").toLowerCase();
  return ["1", "true", "active", "activated", "approved"].includes(status);
}

function formatCountdown(ms) {
  if (ms <= 0) return "Expired";

  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return `${String(d).padStart(2, "0")}d ${String(h).padStart(
    2,
    "0"
  )}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
}

function formatCurrency(value) {
  return `₹${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}`;
}


function Card({ title, amount, note, color, icon }) {
  return (
    <div className={`p-6 rounded-xl text-white shadow ${color}`}>
      <div className="flex justify-between items-start">
        <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl">{icon}</span>
        </div>
      </div>

      <h3 className="text-lg opacity-90 mt-4">{title}</h3>
      <h2 className="text-4xl font-bold mt-1">{amount}</h2>
      <p className="text-sm opacity-80 mt-1">{note}</p>
    </div>
  );
}


export default function Dashboard() {
  const [memberData, setMemberData] = useState(readStoredMemberData());

  const memberUserId = memberData.user_id || "";
  const welcomeName = memberData.fullname || memberUserId || "Member";
  const customerId = memberUserId ? `MLM-${memberUserId}` : "MLM-00000";

  const memberStep = getMemberStep(memberData);
  const isActive = isMemberActivated(memberData) && memberStep > 0;

  const activationKey = `memberActivationDeadline30d:${memberUserId}`;

  const getDeadline = () => {
    const stored = Number(localStorage.getItem(activationKey));
    const now = Date.now();

    if (stored && stored > now) return stored;

    const deadline = now + ACTIVATION_WINDOW_MS;
    localStorage.setItem(activationKey, deadline);
    return deadline;
  };

  const [countdown, setCountdown] = useState(
    isActive ? "Active" : formatCountdown(getDeadline() - Date.now())
  );

  const [stats, setStats] = useState({
    purchase_balance: 0,
    turnover_balance: 0,
    purchase_orders: 0,
    sales_orders: 0,
    sales_turnover: 0,
    commission_amount: 0,
  });

  useEffect(() => {
    if (!memberUserId) return;

    const fetchDashboard = async () => {
      try {
        const res = await requestMemberApi("/member/dashboard", {
          headers: { "X-Auth-Member": memberUserId },
        });

        if (!res.ok) return;

        const data = res.data;

        const updated = {
          ...memberData,
          selected_package_id: data.selected_package_id,
          selected_package_step: data.selected_package_step,
          package_step: data.package_step,
          step_level: data.step_level,
          status: data.status,
        };

        setMemberData(updated);
        localStorage.setItem("memberData", JSON.stringify(updated));
      } catch {}
    };

    fetchDashboard();
  }, [memberUserId]);


  useEffect(() => {
    if (isActive) {
      setCountdown("Active");
      return;
    }

    const deadline = getDeadline();

    const interval = setInterval(() => {
      setCountdown(formatCountdown(deadline - Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);


  useEffect(() => {
    if (!memberUserId) return;

    const loadStats = async () => {
      try {
        const res = await requestMemberApi("/member/dashboard-stats", {
          headers: { "X-Auth-Member": memberUserId },
        });

        if (!res.ok) return;

        const d = res.data?.data || {};

        setStats({
          purchase_balance: Number(d.purchase_balance) || 0,
          turnover_balance: Number(d.turnover_balance) || 0,
          purchase_orders: Number(d.purchase_orders) || 0,
          sales_orders: Number(d.sales_orders) || 0,
          sales_turnover: Number(d.sales_turnover) || 0,
          commission_amount: Number(d.commission_amount) || 0,
        });
      } catch {}
    };

    loadStats();
    const timer = setInterval(loadStats, 30000);

    return () => clearInterval(timer);
  }, [memberUserId]);

  const baseSignup = `${window.location.origin}/member/signup`;

  const leftLink = `${baseSignup}?sponsorId=${memberUserId}&position=left`;
  const rightLink = `${baseSignup}?sponsorId=${memberUserId}&position=right`;

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
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
            Welcome back, {welcomeName} ({customerId})
          </div>

          {/* Activation */}
          <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow mt-5 flex justify-between">
            <span>
              {isActive
                ? `ID Active to ${memberStep} Step`
                : "ID Must Be Activated Within 30 Days"}
            </span>
            <span className="font-semibold">{countdown}</span>
          </div>

          {/* Referral Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
            <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between">
              <div className="flex gap-2">
                <FaLink className="text-blue-500" />
                <div>
                  <p className="text-gray-500 text-sm">Left Referral</p>
                  <p className="text-sm text-gray-700 truncate">{leftLink}</p>
                </div>
              </div>

              <button
                onClick={() => copyLink(leftLink)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md"
              >
                <FiCopy />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between">
              <div className="flex gap-2">
                <FaLink className="text-blue-500" />
                <div>
                  <p className="text-gray-500 text-sm">Right Referral</p>
                  <p className="text-sm text-gray-700 truncate">{rightLink}</p>
                </div>
              </div>

              <button
                onClick={() => copyLink(rightLink)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md"
              >
                <FiCopy />
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">

            <Card
              title="Purchase Balance"
              amount={formatCurrency(stats.purchase_balance)}
              note="Updated vs last month"
              icon={<LuWallet />}
              color="bg-[linear-gradient(90deg,#3483D2,#2262A1)]"
            />

            <Card
              title="Turnover Balance"
              amount={formatCurrency(stats.turnover_balance)}
              note="Growth vs last month"
              icon={<GoArrowUpRight />}
              color="bg-[linear-gradient(90deg,#45B0D7,#268CB1)]"
            />

            <Card
              title="Purchase Orders"
              amount={stats.purchase_orders}
              note="Orders this month"
              icon={<BsCart />}
              color="bg-[linear-gradient(90deg,#2DA5D2,#2874BE)]"
            />

            <Card
              title="No. of Sales Orders"
              amount={stats.sales_orders}
              note="Sales this month"
              icon={<HiOutlineDocumentText />}
              color="bg-[linear-gradient(90deg,#B74331,#8A3225)]"
            />

            <Card
              title="Sales Turnover Amount"
              amount={formatCurrency(stats.sales_turnover)}
              note="Revenue this month"
              icon={<FaIndianRupeeSign />}
              color="bg-[linear-gradient(90deg,#2A9EC9,#266DB2)]"
            />

            <Card
              title="Commission Amount"
              amount={formatCurrency(stats.commission_amount)}
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