import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { requestMemberApi } from "../utils/apiClient";

import {
  FaLink,
  FaIndianRupeeSign,
  FaUsers,
  FaUserCheck,
  FaCodeBranch,
} from "react-icons/fa6";
import { FiCopy } from "react-icons/fi";
import { LuWallet } from "react-icons/lu";
import { BsCart } from "react-icons/bs";
import { CiMedal } from "react-icons/ci";
import { HiOutlineDocumentText } from "react-icons/hi";
import { GoArrowUpRight } from "react-icons/go";
import { MdOutlineManageAccounts } from "react-icons/md";
import { GiAchievement } from "react-icons/gi";

const ACTIVATION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_STATS = {
  total_team: 0,
  total_register_team: 0,
  total_active_team: 0,
  total_manager_left: 0,
  total_manager_right: 0,
  id_position_step: 0,
  leadership_rank: "N/A",
  rank_with_reward: "N/A",
  repurchase_balance: 0,
  consistency_balance: 0,
  earning_balance: 0,
  daily_earn: 0,
  direct_id: 0,
  direct_branch: 0,
};

const STEP_DETAILS = {
  1: {
    step: 1,
    pv: 125,
    per_cycle_capping: 500,
    daily_capping: 1000,
  },
  2: {
    step: 2,
    pv: 250,
    per_cycle_capping: 1000,
    daily_capping: 2000,
  },
  3: {
    step: 3,
    pv: 500,
    per_cycle_capping: 2000,
    daily_capping: 4000,
  },
  4: {
    step: 4,
    pv: 1000,
    per_cycle_capping: 5000,
    daily_capping: 10000,
  },
  5: {
    step: 5,
    pv: 2000,
    per_cycle_capping: 10000,
    daily_capping: 20000,
  },
  6: {
    step: 6,
    pv: 4000,
    per_cycle_capping: 20000,
    daily_capping: 40000,
  },
};

function getStoredMemberData() {
  try {
    return JSON.parse(localStorage.getItem("memberData") || "{}");
  } catch {
    return {};
  }
}

function saveMemberData(data) {
  localStorage.setItem("memberData", JSON.stringify(data));
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getStepFromPackageId(packageId) {
  const match = String(packageId || "").match(/step[-_]?(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function getMemberStep(member) {
  return toNumber(
    member?.selected_package_step ??
      member?.package_step ??
      member?.step_level ??
      member?.current_step ??
      getStepFromPackageId(member?.selected_package_id)
  );
}

function isActivated(member) {
  const status = String(member?.status ?? "").toLowerCase().trim();
  const step = getMemberStep(member);

  return (
    ["1", "true", "active", "activated", "approved"].includes(status) ||
    step > 0 ||
    !!member?.activation_date
  );
}

function formatCountdown(ms) {
  if (ms <= 0) return "Expired";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(
    2,
    "0"
  )}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function formatCurrency(value) {
  return `₹${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(toNumber(value))}`;
}

function StatCard({ title, amount, note, icon, color }) {
  return (
    <div
      className={`p-6 rounded-xl text-white shadow ${color} h-full min-h-60 flex flex-col`}
    >
      <div className="flex justify-between items-start">
        <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>

      <h3 className="text-lg opacity-90 mt-4">{title}</h3>
      <h2 className="text-4xl font-bold mt-2 wrap-break-word">{amount}</h2>
      <p className="text-sm opacity-80 mt-2">{note}</p>
    </div>
  );
}

function IdPositionCard({ step, dailyEarn, icon, color }) {
  const safeStep = Math.min(Math.max(toNumber(step), 0), 6);
  const stepInfo = STEP_DETAILS[safeStep];

  return (
    <div
      className={`p-6 rounded-xl text-white shadow ${color} h-full min-h-60 flex flex-col`}
    >
      <div className="flex justify-between items-start">
        <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>

      <h3 className="text-lg opacity-90 mt-4">ID Position Step</h3>

      <div className="mt-4 flex items-stretch gap-4 flex-1">
        <div className="w-1/2 flex flex-col justify-center">
          <p className="text-sm opacity-80">Current step position</p>
          <h2 className="text-4xl font-bold mt-1">
            {safeStep > 0 ? `${safeStep} Step` : "N/A"}
          </h2>
        </div>

        <div className="w-px bg-white/30" />

        <div className="w-1/2 flex flex-col justify-center gap-3 text-sm">
          {stepInfo ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="opacity-80">PV</span>
                <span className="font-semibold text-right">{stepInfo.pv} PV</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="opacity-80">Per Cycle</span>
                <span className="font-semibold text-right">
                  {formatCurrency(stepInfo.per_cycle_capping)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="opacity-80">Daily Earn</span>
                <span className="font-semibold text-right">
                  {formatCurrency(dailyEarn)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm opacity-80">No step activated yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReferralCard({ title, link, onCopy }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start gap-3">
      <div className="flex gap-2 min-w-0">
        <FaLink className="text-blue-500 mt-1 shrink-0" />
        <div className="min-w-0">
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-sm text-gray-700 truncate">{link}</p>
        </div>
      </div>

      <button
        onClick={onCopy}
        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md shrink-0"
      >
        <FiCopy />
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [memberData, setMemberData] = useState(getStoredMemberData());
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [countdown, setCountdown] = useState("");

  const memberUserId = memberData?.user_id || "";
  const welcomeName = memberData?.fullname || memberUserId || "Member";
  const customerId = memberUserId ? `MLM-${memberUserId}` : "MLM-00000";

  const memberStep = useMemo(() => getMemberStep(memberData), [memberData]);
  const activeStatus = useMemo(() => isActivated(memberData), [memberData]);

  function getActivationDeadline(member) {
    const createdAt = member?.created_at;

    if (createdAt) {
      const createdTime = new Date(createdAt).getTime();
      if (!Number.isNaN(createdTime)) {
        return createdTime + ACTIVATION_WINDOW_MS;
      }
    }

    return Date.now() + ACTIVATION_WINDOW_MS;
  }

  useEffect(() => {
    if (!memberUserId) return;

    const fetchDashboardData = async () => {
      try {
        const res = await requestMemberApi("/member/dashboard", {
          headers: { "X-Auth-Member": memberUserId },
        });

        if (!res?.ok) return;

        const data = res.data || {};

        const updatedMember = {
          ...memberData,
          ...data,
          selected_package_id:
            data.selected_package_id ?? memberData?.selected_package_id,
          selected_package_step:
            data.selected_package_step ?? memberData?.selected_package_step,
          package_step: data.package_step ?? memberData?.package_step,
          step_level: data.step_level ?? memberData?.step_level,
          current_step: data.current_step ?? memberData?.current_step,
          status: data.status ?? memberData?.status,
          activation_date: data.activation_date ?? memberData?.activation_date,
          created_at: data.created_at ?? memberData?.created_at,
          fullname: data.fullname ?? memberData?.fullname,
          user_id: data.user_id ?? memberData?.user_id,
        };

        setMemberData(updatedMember);
        saveMemberData(updatedMember);
      } catch (error) {
        console.error("Dashboard member data fetch error:", error);
      }
    };

    fetchDashboardData();
  }, [memberUserId]);

  useEffect(() => {
    if (!memberUserId) return;

    if (activeStatus) {
      setCountdown(memberStep > 0 ? `${memberStep} Step` : "Active");
      return;
    }

    const deadline = getActivationDeadline(memberData);

    const updateCountdown = () => {
      setCountdown(formatCountdown(deadline - Date.now()));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [memberUserId, activeStatus, memberData, memberStep]);

  useEffect(() => {
    if (!memberUserId) return;

    const loadStats = async () => {
      try {
        const res = await requestMemberApi("/member/dashboard-stats", {
          headers: { "X-Auth-Member": memberUserId },
        });

        if (!res?.ok) return;

        const data = res?.data?.data || {};

        setStats({
          total_team: toNumber(data.total_team),
          total_register_team: toNumber(
            data.total_register_team ?? data.total_team
          ),
          total_active_team: toNumber(data.total_active_team),
          total_manager_left: toNumber(data.total_manager_left),
          total_manager_right: toNumber(data.total_manager_right),
          id_position_step: toNumber(
            data.id_position_step ||
              data.package_step ||
              data.step_level ||
              data.current_step
          ),
          leadership_rank: data.leadership_rank || "N/A",
          rank_with_reward: data.rank_with_reward || "N/A",
          repurchase_balance: toNumber(data.repurchase_balance),
          consistency_balance: toNumber(data.consistency_balance),
          earning_balance: toNumber(data.earning_balance),
          daily_earn: toNumber(data.daily_earn),
          direct_id: toNumber(data.direct_id),
          direct_branch: toNumber(data.direct_branch),
        });
      } catch (error) {
        console.error("Dashboard stats fetch error:", error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, [memberUserId]);

  const signupBaseUrl = `${window.location.origin}/member/signup`;
  const leftReferralLink = `${signupBaseUrl}?sponsorId=${memberUserId}&position=left`;
  const rightReferralLink = `${signupBaseUrl}?sponsorId=${memberUserId}&position=right`;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied!");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const topCards = [
    {
      title: "Total Team",
      amount: stats.total_team,
      note: "Total members in your network",
      icon: <FaUsers />,
      color: "bg-[linear-gradient(90deg,#3483D2,#2262A1)]",
    },
    {
      title: "Total Register Team",
      amount: stats.total_register_team,
      note: "Registered members in your team",
      icon: <FaUsers />,
      color: "bg-[linear-gradient(90deg,#45B0D7,#268CB1)]",
    },
    {
      title: "Total Active Team",
      amount: stats.total_active_team,
      note: "Active registered team members",
      icon: <FaUserCheck />,
      color: "bg-[linear-gradient(90deg,#45B0D7,#268CB1)]",
    },
    {
      title: "Total Manager (Left / Right)",
      amount: `${stats.total_manager_left} / ${stats.total_manager_right}`,
      note: "Managers by side",
      icon: <MdOutlineManageAccounts />,
      color: "bg-[linear-gradient(90deg,#2DA5D2,#2874BE)]",
    },
    {
      type: "id_position",
      step: stats.id_position_step || memberStep,
      icon: <HiOutlineDocumentText />,
      color: "bg-[linear-gradient(90deg,#B74331,#8A3225)]",
    },
    {
      title: "Leadership Rank",
      amount: stats.leadership_rank,
      note: "Current rank",
      icon: <GiAchievement />,
      color: "bg-[linear-gradient(90deg,#2A9EC9,#266DB2)]",
    },
    {
      title: "Rank With Reward",
      amount: stats.rank_with_reward,
      note: "Reward linked to rank",
      icon: <CiMedal />,
      color: "bg-[linear-gradient(90deg,#9B4032,#2864A3)]",
    },
    {
      title: "Repurchase Balance",
      amount: formatCurrency(stats.repurchase_balance),
      note: "Current repurchase wallet",
      icon: <LuWallet />,
      color: "bg-[linear-gradient(90deg,#3483D2,#2262A1)]",
    },
    {
      title: "Consistency Balance",
      amount: formatCurrency(stats.consistency_balance),
      note: "Current consistency wallet",
      icon: <GoArrowUpRight />,
      color: "bg-[linear-gradient(90deg,#45B0D7,#268CB1)]",
    },
    {
      title: "Earning Balance",
      amount: formatCurrency(stats.earning_balance),
      note: "Total earnings",
      icon: <FaIndianRupeeSign />,
      color: "bg-[linear-gradient(90deg,#2DA5D2,#2874BE)]",
    },
    {
      title: "Direct ID",
      amount: stats.direct_id,
      note: "Directly sponsored IDs",
      icon: <BsCart />,
      color: "bg-[linear-gradient(90deg,#B74331,#8A3225)]",
    },
    {
      title: "Direct Branch",
      amount: stats.direct_branch,
      note: "Direct branch count",
      icon: <FaCodeBranch />,
      color: "bg-[linear-gradient(90deg,#2A9EC9,#266DB2)]",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="p-6">
          <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow">
            Welcome back, {welcomeName} ({customerId})
          </div>

          <div className="bg-linear-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow mt-5 flex justify-between flex-wrap gap-2">
            <span>
              {activeStatus
                ? `ID Active to ${memberStep} Step`
                : "ID Must Be Activated Within 30 Days"}
            </span>
            <span className="font-semibold">{countdown}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
            <ReferralCard
              title="Left Referral"
              link={leftReferralLink}
              onCopy={() => copyToClipboard(leftReferralLink)}
            />

            <ReferralCard
              title="Right Referral"
              link={rightReferralLink}
              onCopy={() => copyToClipboard(rightReferralLink)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6 items-stretch">
            {topCards.map((card, index) =>
              card.type === "id_position" ? (
                <IdPositionCard
                  key={`id-position-${index}`}
                  step={card.step}
                  dailyEarn={stats.daily_earn}
                  icon={card.icon}
                  color={card.color}
                />
              ) : (
                <StatCard key={card.title} {...card} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}