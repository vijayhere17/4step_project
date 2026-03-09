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

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const FALLBACK_PACKAGE_OPTIONS = [
  {
    id: "step-1",
    label: "1 Step",
    pv: "250 PV",
    amountRange: "₹1199 - ₹1500",
    cycleCapping: "₹1000",
    dailyCapping: "₹2000",
  },
  {
    id: "step-2",
    label: "2 Step",
    pv: "500 PV",
    amountRange: "₹1999 - ₹2500",
    cycleCapping: "₹2000",
    dailyCapping: "₹4000",
  },
  {
    id: "step-3",
    label: "3 Step",
    pv: "750 PV",
    amountRange: "₹2999 - ₹3500",
    cycleCapping: "₹3000",
    dailyCapping: "₹6000",
  },
  {
    id: "step-4",
    label: "4 Step",
    pv: "1000 PV",
    amountRange: "₹3999 - ₹4500",
    cycleCapping: "₹5000",
    dailyCapping: "₹10000",
  },
  {
    id: "step-5",
    label: "5 Step Pro",
    pv: "1000 PV",
    amountRange: "₹5999 - ₹7500",
    cycleCapping: "₹5000",
    dailyCapping: "₹10000",
  },
  {
    id: "step-6",
    label: "6 Step Pro",
    pv: "2000 PV",
    amountRange: "₹11599 - ₹15000",
    cycleCapping: "₹10000",
    dailyCapping: "₹20000",
  },
  {
    id: "step-7",
    label: "7 Step Pro",
    pv: "4000 PV",
    amountRange: "₹22999 - ₹30000",
    cycleCapping: "₹20000",
    dailyCapping: "₹40000",
  },
];

function formatActivationCountdown(milliseconds) {
  if (milliseconds <= 0) return "Expired";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatCurrencyInr(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`;
}

function normalizePackageOption(pkg, index) {
  if (!pkg || typeof pkg !== "object") {
    return null;
  }

  const fallbackId = `step-${index + 1}`;
  const id = String(pkg.id || (pkg.step ? `step-${pkg.step}` : fallbackId));

  const pvNumber = Number(pkg.pv);
  const pv =
    typeof pkg.pv === "string" && pkg.pv.includes("PV")
      ? pkg.pv
      : Number.isFinite(pvNumber)
        ? `${pvNumber} PV`
        : "0 PV";

  const amountRange =
    typeof pkg.amountRange === "string" && pkg.amountRange.trim().length > 0
      ? pkg.amountRange
      : formatCurrencyInr(pkg.amount_min) && formatCurrencyInr(pkg.amount_max)
        ? `${formatCurrencyInr(pkg.amount_min)} - ${formatCurrencyInr(pkg.amount_max)}`
        : "-";

  const cycleCapping =
    typeof pkg.cycleCapping === "string" && pkg.cycleCapping.trim().length > 0
      ? pkg.cycleCapping
      : formatCurrencyInr(pkg.cycle_capping) || "-";

  const dailyCapping =
    typeof pkg.dailyCapping === "string" && pkg.dailyCapping.trim().length > 0
      ? pkg.dailyCapping
      : formatCurrencyInr(pkg.daily_capping) || "-";

  return {
    id,
    label: String(pkg.label || (pkg.step ? `${pkg.step} Step` : `Step ${index + 1}`)),
    pv,
    amountRange,
    cycleCapping,
    dailyCapping,
  };
}

function getStoredSelectedPackage(storageKey) {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return localStorage.getItem(storageKey) || "";
  } catch {
    return "";
  }
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
  // build referral links using logged-in member's user_id (falls back to placeholder)
  let memberData = {};
  try {
    memberData = JSON.parse(localStorage.getItem("memberData") || "{}") || {};
  } catch {
    memberData = {};
  }

  // welcome name and id
  const welcomeName = memberData.fullname || memberData.user_id || "Member";
  const customerId = memberData.user_id
    ? `MLM-${memberData.user_id}`
    : "MLM-00000";

  const sponsorId = memberData.user_id || memberData.id || "FC7981495";
  const memberUserId = memberData.user_id || "";
  const activationUserKey = memberData.user_id || memberData.id || "guest";
  const activationStorageKey = `memberActivationDeadline:${activationUserKey}`;
  const selectedPackageStorageKey = `memberSelectedPackage:${activationUserKey}`;

  const getOrCreateActivationDeadline = () => {
    const storedDeadline = Number(localStorage.getItem(activationStorageKey));
    if (Number.isFinite(storedDeadline) && storedDeadline > Date.now()) {
      return storedDeadline;
    }

    const newDeadline = Date.now() + THIRTY_DAYS_MS;
    localStorage.setItem(activationStorageKey, String(newDeadline));
    return newDeadline;
  };

  const [activationCountdown, setActivationCountdown] = useState(() => {
    const deadline = getOrCreateActivationDeadline();
    return formatActivationCountdown(deadline - Date.now());
  });
  const [memberStatus, setMemberStatus] = useState(Number(memberData.status || 0));
  const [packageOptions, setPackageOptions] = useState(FALLBACK_PACKAGE_OPTIONS);
  const [selectedPackageId, setSelectedPackageId] = useState(() => {
    return getStoredSelectedPackage(selectedPackageStorageKey) || FALLBACK_PACKAGE_OPTIONS[0].id;
  });
  const [isActivatingPackage, setIsActivatingPackage] = useState(false);
  const [activationNotice, setActivationNotice] = useState("");

  useEffect(() => {
    const deadline = getOrCreateActivationDeadline();

    const tick = () => {
      setActivationCountdown(formatActivationCountdown(deadline - Date.now()));
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [activationStorageKey]);

  useEffect(() => {
    const fetchPackageOptions = async () => {
      if (!memberUserId) {
        return;
      }

      try {
        const response = await requestMemberApi("/member/dashboard", {
          headers: {
            Accept: "application/json",
            "X-Auth-Member": memberUserId,
          },
        });

        if (!response.ok) {
          return;
        }

        const apiPackages = Array.isArray(response.data?.packages)
          ? response.data.packages
          : [];

        const normalizedPackages = apiPackages
          .map((pkg, index) => normalizePackageOption(pkg, index))
          .filter(Boolean);

        if (!normalizedPackages.length) {
          return;
        }

        setPackageOptions(normalizedPackages);

        const apiSelectedPackageId = response.data?.selected_package_id;
        const storedPackageId = getStoredSelectedPackage(selectedPackageStorageKey);
        const preferredPackageId =
          storedPackageId || apiSelectedPackageId || normalizedPackages[0].id;

        const preferredPackageExists = normalizedPackages.some(
          (pkg) => pkg.id === preferredPackageId,
        );

        setSelectedPackageId(
          preferredPackageExists ? preferredPackageId : normalizedPackages[0].id,
        );
      } catch (error) {
        console.error("Failed to load package options:", error);
      }
    };

    fetchPackageOptions();
  }, [memberUserId, selectedPackageStorageKey]);

  useEffect(() => {
    if (!packageOptions.some((pkg) => pkg.id === selectedPackageId)) {
      setSelectedPackageId(packageOptions[0]?.id || FALLBACK_PACKAGE_OPTIONS[0].id);
    }
  }, [packageOptions, selectedPackageId]);

  useEffect(() => {
    if (!selectedPackageId) {
      return;
    }

    try {
      localStorage.setItem(selectedPackageStorageKey, selectedPackageId);
    } catch {
      // Ignore storage write errors.
    }
  }, [selectedPackageId, selectedPackageStorageKey]);

  const baseSignup = `${window.location.origin}/member/signup`;
  const leftLink = `${baseSignup}?sponsorId=${encodeURIComponent(sponsorId)}&position=left`;
  const rightLink = `${baseSignup}?sponsorId=${encodeURIComponent(sponsorId)}&position=right`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Link copied!");
  };

  const activateSelectedPackage = async () => {
    if (!memberUserId) {
      setActivationNotice("Sign in first to activate a package.");
      return;
    }

    try {
      setIsActivatingPackage(true);
      setActivationNotice("");

      const response = await requestMemberApi("/member/activate-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Auth-Member": memberUserId,
        },
        body: JSON.stringify({
          package_id: selectedPackageId,
        }),
      });

      if (!response.ok) {
        setActivationNotice(response.data?.message || "Unable to activate package.");
        return;
      }

      setMemberStatus(1);
      setActivationNotice(response.data?.message || "Package activated successfully.");

      try {
        const storedMemberData =
          JSON.parse(localStorage.getItem("memberData") || "{}") || {};

        localStorage.setItem(
          "memberData",
          JSON.stringify({
            ...storedMemberData,
            status: 1,
            activation_date:
              response.data?.member?.activation_date || storedMemberData.activation_date,
          }),
        );
      } catch {
        // Ignore local storage update errors.
      }
    } catch (error) {
      console.error("Package activation failed:", error);
      setActivationNotice("Unable to connect to server while activating package.");
    } finally {
      setIsActivatingPackage(false);
    }
  };

  const selectedPackage =
    packageOptions.find((pkg) => pkg.id === selectedPackageId) ||
    packageOptions[0] ||
    FALLBACK_PACKAGE_OPTIONS[0];

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
            <span>Id Must be Activated within 30 Days</span>
            <span className="font-semibold whitespace-nowrap">{activationCountdown}</span>
          </div>
           {/* Package Selector */}
          <div className="bg-white px-5 py-4 rounded-lg shadow mt-5 mb-5">
            <label
              htmlFor="package-select"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Select {packageOptions.length} Package{packageOptions.length === 1 ? "" : "s"}
            </label>
            <select
              id="package-select"
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(event.target.value)}
              className="w-full md:max-w-md border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {packageOptions.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.label} - {pkg.pv} - {pkg.amountRange}
                </option>
              ))}
            </select>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={activateSelectedPackage}
                disabled={isActivatingPackage}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-4 py-2 rounded-md"
              >
                {isActivatingPackage ? "Activating..." : "Activate Selected Package"}
              </button>

              <span
                className={`text-sm font-semibold ${
                  memberStatus === 1 ? "text-green-700" : "text-amber-700"
                }`}
              >
                Status: {memberStatus === 1 ? "Activated" : "Inactive"}
              </span>
            </div>

            {activationNotice && (
              <p className="mt-2 text-sm text-gray-700">{activationNotice}</p>
            )}

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                <p className="text-gray-500">PV</p>
                <p className="font-semibold text-blue-700">{selectedPackage.pv}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                <p className="text-gray-500">Amount Range</p>
                <p className="font-semibold text-blue-700">{selectedPackage.amountRange}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                <p className="text-gray-500">Per Cycle Capping</p>
                <p className="font-semibold text-blue-700">{selectedPackage.cycleCapping}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                <p className="text-gray-500">Daily Capping</p>
                <p className="font-semibold text-blue-700">{selectedPackage.dailyCapping}</p>
              </div>
            </div>
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
              amount="₹1,24,500"
              note="Updated vs last month"
              icon={<LuWallet />}
              color="bg-[linear-gradient(90deg,#3483D2,#2262A1)]"
            />

            {/* Turnover */}
            <Card
              title="Turnover Balance"
              amount="₹1,24,500"
              note="Growth vs last month"
              icon={<GoArrowUpRight />}
              color="bg-[linear-gradient(90deg,#45B0D7,#268CB1)]"
            />

            {/* Purchase Orders */}
            <Card
              title="Purchase Orders"
              amount="124"
              note="Orders this month"
              icon={<BsCart />}
              color="bg-[linear-gradient(90deg,#2DA5D2,#2874BE)]"
            />

            {/* Sales Orders */}
            <Card
              title="No. of Sales Orders"
              amount="89"
              note="Sales this month"
              icon={<HiOutlineDocumentText />}
              color="bg-[linear-gradient(90deg,#B74331,#8A3225)]"
            />

            {/* Sales Turnover */}
            <Card
              title="Sales Turnover Amount"
              amount="₹5,24,500"
              note="Revenue this month"
              icon={<FaIndianRupeeSign />}
              color="bg-[linear-gradient(90deg,#2A9EC9,#266DB2)]"
            />

            {/* Commission */}
            <Card
              title="Commission Amount"
              amount="₹24,500"
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
