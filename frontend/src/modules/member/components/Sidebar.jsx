import React, { useEffect, useState } from "react";
import { MdProductionQuantityLimits } from "react-icons/md";



import {
  MdOutlineDashboard,
  MdOutlineLocalShipping,
  MdAutorenew,
  MdMailOutline,
} from "react-icons/md";
import { GoPerson } from "react-icons/go";
import { LuNetwork, LuWallet } from "react-icons/lu";
import { BsCart, BsWallet } from "react-icons/bs";
import {
  FiDownload,
  FiChevronDown,  
  FiChevronRight,
  FiAward,
} from "react-icons/fi";
import { AiTwotoneClockCircle } from "react-icons/ai";
import { FaRegStar } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiRefreshCcw } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";
import { FiLogOut } from "react-icons/fi";

export default function Sidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {
  localStorage.removeItem("memberSession");
  localStorage.removeItem("memberData");
  navigate("/member/signin", { replace: true });
};
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMenuLinkClick = (event) => {
    if (!isMobileOpen) return;

    const clickedLink = event.target.closest("a");
    if (clickedLink) {
      setIsMobileOpen(false);
    }
  };

  const [member, setMember] = useState(null);
  useEffect(() => {
  const storedMember = localStorage.getItem("memberData");
  if (storedMember) {
    setMember(JSON.parse(storedMember));
  }
}, []);

  // Dashboard
  const isDashboard = location.pathname === "/member/dashboard";

  // Account Routes
  const isProfile = location.pathname === "/member/profile";
  const isKyc = location.pathname === "/member/kyc";
  const isCreateIdCard = location.pathname === "/member/create-id-card";
  const isWelcomeLetter = location.pathname === "/member/welcome-letter";
  const isRoyaltyCertificate =
    location.pathname === "/member/royalty-certificate";
  const isAccountSection =
    isProfile ||
    isKyc ||
    isCreateIdCard ||
    isWelcomeLetter ||
    isRoyaltyCertificate;

  // Portfolio Routes
  const isBuiltupTree = location.pathname === "/member/builtup-tree";
  const isMyReferralPromoter =
    location.pathname === "/member/referral-promoters";
  const isReferralBranch = location.pathname === "/member/referral-branch";
  const isLeftDownline =
    location.pathname === "/member/left-downline" ||
    location.pathname === "/member/left-right-downline";
  const isRightDownline = location.pathname === "/member/right-downline";
  const isPortfolioSection =
    isBuiltupTree ||
    isMyReferralPromoter ||
    isReferralBranch ||
    isLeftDownline ||
    isRightDownline;

  // Portfolio Details Routes
  const isMatchingStatus = location.pathname === "/member/matching-status";
  const isRepurchaseStatus = location.pathname === "/member/repurchase-status";
  const isConsistencyStatus =
    location.pathname === "/member/consistency-status";
  const isDiwaliCelebration =
    location.pathname === "/member/diwali-celebration";
  const isMonitoringStatus = location.pathname === "/member/monitoring-status";
  const isRoyaltyStatus = location.pathname === "/member/royalty-status";
  const isTravelclubStatus = location.pathname === "/member/travelclub-status";
  const isRankWithRewardStatus =
    location.pathname === "/member/rank-reward-status";
  const isPortfolioDetailsSection =
    isMatchingStatus ||
    isDiwaliCelebration ||
    isMonitoringStatus ||
    isRepurchaseStatus ||
    isConsistencyStatus ||
    isRoyaltyStatus ||
    isTravelclubStatus ||
    isRankWithRewardStatus;

  // Purchase Balance Routes
  const isRequest = location.pathname === "/member/Request";
  const isHistory = location.pathname === "/member/History";
  const isTransaction = location.pathname === "/member/Transaction";
  const isPurchaseBalanceSection = isRequest || isHistory || isTransaction;

  // Earning Reports
  const isGroupBuiltupBonus =
    location.pathname === "/member/earning-group-builtup";
  const isdiwaliCelebrationBonus =
    location.pathname === "/member/earning-diwali";
  const isRoyaltyClubBonus = location.pathname === "/member/earning-royalty";
  const isBusinessMonitoringBonus =
    location.pathname === "/member/earning-monitoring";
  const isLeadershipRankBonus =
    location.pathname === "/member/earning-leadership";
  const isRepurchaseBonus = location.pathname === "/member/earning-repurchase";
  const isFamilySaverBonus = location.pathname === "/member/earning-family";
  const isBranchTurnoverBonus = location.pathname === "/member/earning-branch";
  const isEarningReportsSection =
    isGroupBuiltupBonus ||
    isdiwaliCelebrationBonus ||
    isRoyaltyClubBonus ||
    isBusinessMonitoringBonus ||
    isLeadershipRankBonus ||
    isRepurchaseBonus ||
    isFamilySaverBonus ||
    isBranchTurnoverBonus;

  // Earning Balance
  const isEarningHistory = location.pathname === "/member/earning-history";
  const isEarningWithdrawalReport =
    location.pathname === "/member/withdrawal-report";
  const isIncomeSummary = location.pathname === "/member/income-summary";
  const isIncomeReport = location.pathname === "/member/income-report";
  const isEarningBalanceSection =
    isEarningHistory || isEarningWithdrawalReport || isIncomeSummary || isIncomeReport;

  // Mail box
  const isCompose = location.pathname === "/member/compose";
  const isInbox = location.pathname === "/member/inbox";
  const isOutbox = location.pathname === "/member/outbox";
  const isMailBoxSection = isCompose || isInbox || isOutbox;
  const isProducts = location.pathname === "/member/products";

  const [openAccount, setOpenAccount] = useState(isAccountSection);
  const [openPortfolio, setOpenPortfolio] = useState(isPortfolioSection);
  const [openPortfolioDetails, setOpenPortfolioDetails] = useState(
    isPortfolioDetailsSection,
  );
  // const [openPurchaseBalance, setOpenPurchaseBalance] = useState(isPurchaseBalanceSection);
  const [openEarningReports, setOpenEarningReports] = useState(
    isEarningReportsSection,
  );
  const [openEarningBalance, setOpenEarningBalance] = useState(
    isEarningBalanceSection,
  );
  const [openMailBox, setOpenMailBox] = useState(isMailBoxSection);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsMobileOpen((prev) => !prev);
    };

    window.addEventListener("toggle-sidebar", handleToggleSidebar);
    return () =>
      window.removeEventListener("toggle-sidebar", handleToggleSidebar);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // useEffect(() => {
  //   if (isAccountSection) setOpenAccount(true);
  // }, [isAccountSection]);

  // useEffect(() => {
  //   if (isPortfolioSection) setOpenPortfolio(true);
  // }, [isPortfolioSection]);

  // useEffect(() => {
  //   if (isPortfolioDetailsSection) setOpenPortfolioDetails(true);
  // }, [isPortfolioDetailsSection]);

  // useEffect(() => {
  //   if (isPurchaseBalanceSection) setOpenPurchaseBalance(true);
  // }, [isPurchaseBalanceSection]);

  // useEffect(() => {
  //   if (isEarningReportsSection) setOpenEarningReports(true);
  // }, [isEarningReportsSection]);

  // useEffect(() => {
  //   if (isEarningBalanceSection) setOpenEarningBalance(true);
  // }, [isEarningBalanceSection]);

  return (
    <>
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden ${isMobileOpen ? "block" : "hidden"}`}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-300 flex flex-col shrink-0 transform transition-transform duration-200 lg:z-auto lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-300">
          <img src="/assets/4Step (1).png" alt="logo" className="h-9" />
          <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
            One destination success
          </p>
        </div>

        {/* Menu */}
        <div
          className="flex-1 overflow-y-auto p-4 text-sm space-y-1"
          onClickCapture={handleMenuLinkClick}
        >
          {/* Dashboard */}
          <Link
            to="/member/dashboard"
            className={`px-3 py-2 rounded flex items-center ${
              isDashboard ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <MdOutlineDashboard className="mr-2 text-[25px]" /> Dashboard
          </Link>

          {/* My Account Dropdown */}
          <div>
            <div
              onClick={() => setOpenAccount(!openAccount)}
              className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
                isAccountSection
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center ">
                <GoPerson className="mr-2 text-[25px]" /> My Account
              </span>
              {openAccount ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {openAccount && (
              <div className="ml-7 text-gray-600 space-y-1">
                <Link
                  to="/member/profile"
                  className={`block px-2 py-1 rounded ${
                    isProfile ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                  }`}
                >
                  My Profile
                </Link>

                <Link
                  to="/member/kyc"
                  className={`block px-2 py-1 rounded ${
                    isKyc ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                  }`}
                >
                  My KYC
                </Link>

                <Link
                  to="/member/create-id-card"
                  className={`block px-2 py-1 rounded ${
                    isCreateIdCard
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Create ID Card
                </Link>
                <Link
                  to="/member/welcome-letter"
                  className={`block px-2 py-1 rounded ${
                    isWelcomeLetter
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Welcome Letter
                </Link>
                <Link
                  to="/member/royalty-certificate"
                  className={`block px-2 py-1 rounded ${
                    isRoyaltyCertificate
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Royalty Certificate
                </Link>
              </div>
            )}
          </div>

          {/* My Portfolio Dropdown */}
          <div>
            <div
              onClick={() => setOpenPortfolio(!openPortfolio)}
              className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
                isPortfolioSection
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center">
                <LuNetwork className="mr-2 text-[25px]" /> My Portfolio
              </span>
              {openPortfolio ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {openPortfolio && (
              <div className="ml-7 text-gray-600 space-y-1">
                <Link
                  to="/member/builtup-tree"
                  className={`block px-2 py-1 rounded ${
                    isBuiltupTree
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Builtup Tree
                </Link>

                <Link
                  to="/member/referral-promoters"
                  className={`block px-2 py-1 rounded ${
                    isMyReferralPromoter
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Referral Promoter
                </Link>

                <Link
                  to="/member/referral-branch"
                  className={`block px-2 py-1 rounded ${
                    isReferralBranch
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Referral Branch
                </Link>
                <Link
                  to="/member/left-downline"
                  className={`block px-2 py-1 rounded ${
                    isLeftDownline
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Left Downline
                </Link>
                 <Link
                  to="/member/right-downline"
                  className={`block px-2 py-1 rounded ${
                    isRightDownline
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Right Downline
                </Link>
              </div>
            )}
          </div>

          {/* Portfolio Details Items */}
          <div>
            <div
              onClick={() => setOpenPortfolioDetails(!openPortfolioDetails)}
              className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
                isPortfolioDetailsSection
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center">
                <IoDocumentTextOutline className="mr-2 text-[25px]" /> My
                Portfolio Details
              </span>
              {openPortfolioDetails ? <FiChevronDown /> : <FiChevronRight />}
            </div>
            {openPortfolioDetails && (
              <div className="ml-7 text-gray-600 space-y-1">
                <Link
                  to="/member/matching-status"
                  className={`block px-2 py-1 rounded ${
                    isMatchingStatus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Matching Status
                </Link>

                <Link
                  to="/member/diwali-celebration"
                  className={`block px-2 py-1 rounded ${
                    isDiwaliCelebration
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Diwali Celebration Status
                </Link>

                <Link
                  to="/member/monitoring-status"
                  className={`block px-2 py-1 rounded ${
                    isMonitoringStatus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Business Monitoring Status
                </Link>

                <Link
                  to="/member/repurchase-status"
                  className={`block px-2 py-1 rounded ${
                    isRepurchaseStatus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Repurchase Status
                </Link>

                <Link
                  to="/member/consistency-status"
                  className={`block px-2 py-1 rounded ${
                    isConsistencyStatus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Consistency Status
                </Link>
                <Link
                  to="/member/royalty-status"
                  className={`block px-2 py-1 rounded ${
                    isRoyaltyStatus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Royalty Status
                </Link>
                <Link
                  to="/member/travelclub-status"
                  className={`block px-2 py-1 rounded ${
                    isTravelclubStatus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Travelclub Status
                </Link>
                <Link
                  to="/member/rank-reward-status"
                  className={`block px-2 py-1 rounded ${
                    isRankWithRewardStatus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Rank With Reward Status
                </Link>
              </div>
            )}
          </div>
          {/* Purchase Balance */}
          {/* <div>
          <div
            onClick={() => setOpenPurchaseBalance(!openPurchaseBalance)}
            className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
              isPurchaseBalanceSection ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center">
              <LuWallet className="mr-2 text-[25px]" /> Purchase Balance
            </span>
            {openPurchaseBalance ? <FiChevronDown /> : <FiChevronRight />}
          </div>
           {openPurchaseBalance && (
            <div className="ml-7 text-gray-600 space-y-1">
              <Link
                to="/Request"
                className={`block px-2 py-1 rounded ${
                  isRequest ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                }`}
              >
                Request
              </Link>

              <Link
                to="/History"
                className={`block px-2 py-1 rounded ${
                  isHistory ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                }`}
              >
                History
              </Link>

              <Link
                to="/Transaction"
                className={`block px-2 py-1 rounded ${
                  isTransaction ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                }`}
              >
                Transaction
              </Link>
            </div>
          )}
        </div> */}
          {/* Earning Reports Dropdown */}
          <div>
            <div
              onClick={() => setOpenEarningReports(!openEarningReports)}
              className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
                isEarningReportsSection
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center">
                <LuWallet className="mr-2 text-[25px]" /> Earning Reports
              </span>
              {openEarningReports ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {openEarningReports && (
              <div className="ml-7 text-gray-600 space-y-1">
                <Link
                  to="/member/earning-group-builtup"
                  className={`block px-2 py-1 rounded ${
                    isGroupBuiltupBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Group Builtup Bonus
                </Link>

                <Link
                  to="/member/earning-diwali"
                  className={`block px-2 py-1 rounded ${
                    isdiwaliCelebrationBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Diwali Celebration Bonus
                </Link>

                <Link
                  to="/member/earning-monitoring"
                  className={`block px-2 py-1 rounded ${
                    isBusinessMonitoringBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Business Monitoring Bonus
                </Link>

                <Link
                  to="/member/earning-repurchase"
                  className={`block px-2 py-1 rounded ${
                    isRepurchaseBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Repurchase Bonus
                </Link>

                <Link
                  to="/member/earning-royalty"
                  className={`block px-2 py-1 rounded ${
                    isRoyaltyClubBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Royalty Club Bonus
                </Link>

                <Link
                  to="/member/earning-leadership"
                  className={`block px-2 py-1 rounded ${
                    isLeadershipRankBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Leadership Rank Bonus
                </Link>

                <Link
                  to="/member/earning-family"
                  className={`block px-2 py-1 rounded ${
                    isFamilySaverBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Family Saver Bonus
                </Link>

                <Link
                  to="/member/earning-branch"
                  className={`block px-2 py-1 rounded ${
                    isBranchTurnoverBonus
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Branch Turnover Bonus
                </Link>
              </div>
            )}
          </div>

          {/* Earning Balance */}
          <div>
            <div
              onClick={() => setOpenEarningBalance(!openEarningBalance)}
              className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
                isEarningBalanceSection
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center ">
                <FiRefreshCcw className="mr-2 text-[25px]" /> Earning Balance
              </span>
              {openEarningBalance ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {openEarningBalance && (
              <div className="ml-7 text-gray-600 space-y-1">
                <Link
                  to="/member/earning-history"
                  className={`block px-2 py-1 rounded ${
                    isEarningHistory
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  History
                </Link>

                <Link
                  to="/member/withdrawal-report"
                  className={`block px-2 py-1 rounded ${
                    isEarningWithdrawalReport
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Withdrawal Report
                </Link>

                <Link
                  to="/member/income-summary"
                  className={`block px-2 py-1 rounded ${
                    isIncomeSummary
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Income Summary
                </Link>
                <Link
                  to="/member/income-report"
                  className={`block px-2 py-1 rounded ${
                    isIncomeReport
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                >
                  Income Report
                </Link>
              </div>
            )}
          </div>
          {/* Mail box */}
          <div>
            <div
              onClick={() => setOpenMailBox(!openMailBox)}
              className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
                isMailBoxSection
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center ">
                <CiMail className="mr-2 text-[25px]" /> Mail Box
              </span>
              {openMailBox ? <FiChevronDown /> : <FiChevronRight />}
            </div>

            {openMailBox && (
              <div className="ml-7 text-gray-600 space-y-1">
                <Link
                  to="/member/compose"
                  className={`block px-2 py-1 rounded ${
                    isCompose ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                  }`}
                >
                  Compose
                </Link>

                <Link
                  to="/member/inbox"
                  className={`block px-2 py-1 rounded ${
                    isInbox ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                  }`}
                >
                  Inbox
                </Link>

                <Link
                  to="/member/outbox"
                  className={`block px-2 py-1 rounded ${
                    isOutbox ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                  }`}
                >
                  Outbox
                </Link>
                
              </div>
            )}
          </div>
          {/* <Link
            to="/member/products"
            className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
              isProducts ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center ">
              <MdProductionQuantityLimits className="mr-2 text-[25px]" /> Products
            </span>
          </Link> */}
          <Link
            to="/member/downloads"
            className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center justify-between"
          >
            <span className="flex items-center ">
              <FiDownload className="mr-2 text-[25px]" /> Downloads
            </span>
          </Link>
          
        </div>

     <div className="border-t bg-gray-100 px-4 py-3">
  <div className="flex items-center justify-between">

    <div className="flex items-center gap-3">

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
        {member?.fullname
          ? member.fullname
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "NA"}
      </div>

      {/* Name + ID */}
      <div className="leading-tight">
        <p className="text-sm font-medium text-gray-800">
          {member?.fullname || ""}
        </p>
        <p className="text-xs text-gray-500">
          {member?.user_id ? `MLM-${member.user_id}` : ""}
        </p>
      </div>

    </div>

    {/* Logout */}
    <button
      onClick={handleLogout}
      className="p-2 rounded-md hover:bg-gray-200 transition-all duration-200 "
    >
      <FiLogOut className="w-5 h-5 text-gray-600" />
    </button>

  </div>
</div>
      </div>
    </>
  );
}
