import React from "react";
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
