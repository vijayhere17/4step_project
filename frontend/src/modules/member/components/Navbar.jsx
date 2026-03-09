import { LuPanelLeftDashed } from "react-icons/lu";
import { MdSupervisorAccount } from "react-icons/md";
import { useEffect, useState } from "react";

export default function Navbar({
  pageTitle = "Dashboard",
  showSubHeader = false,
}) {
  const handleSidebarToggle = () => {
    window.dispatchEvent(new CustomEvent("toggle-sidebar"));
  };

  const [stats, setStats] = useState({
  left_members: 0,
  right_members: 0,
});

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const md =
        JSON.parse(localStorage.getItem("memberData") || "{}") || {};

      if (!md.user_id) return;

      const response = await fetch(
        "http://127.0.0.1:8000/api/member/dashboard",
        {
          headers: {
            "X-Auth-Member": md.user_id,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStats({
          left_members: data.left_members,
          right_members: data.right_members,
        });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  fetchDashboard();
}, []);


  return (
    <div className="bg-white border-b">
      <div className="h-16 px-4 sm:px-6 flex justify-between items-center gap-3">
        {/* Left */}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-gray-700 flex items-center gap-2 truncate">
            <button
              type="button"
              onClick={handleSidebarToggle}
              className="lg:hidden p-1 rounded hover:bg-gray-100"
            >
              <LuPanelLeftDashed />
            </button>

            <LuPanelLeftDashed className="mr-2 hidden lg:block" />
            {pageTitle}
          </h1>

          <p className="text-xs text-gray-400 truncate">
            CUSTOMER ID:{" "}
            {(() => {
              try {
                const md =
                  JSON.parse(localStorage.getItem("memberData") || "{}") || {};
                return md.user_id ? `MLM-${md.user_id}` : "-";
              } catch {
                return "-";
              }
            })()}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-sm text-gray-600 leading-tight hidden md:block">
            <p>
              <MdSupervisorAccount className="inline mr-1" />
              Left Members: <span className="font-semibold">{stats.left_members}</span>
            </p>
            <p>
              <MdSupervisorAccount className="inline mr-1" />
              Right Members: <span className="font-semibold">{stats.right_members}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="w-9 h-9 rounded-full border"
            />
            <div className="text-sm leading-tight hidden sm:block">
              <p className="font-semibold text-gray-700 truncate">
                {(() => {
                  try {
                    const md =
                      JSON.parse(localStorage.getItem("memberData") || "{}") ||
                      {};
                    return md.fullname || md.user_id || "";
                  } catch {
                    return "";
                  }
                })()}
              </p>
              <p className="text-xs text-gray-400">
                {(() => {
                  try {
                    const md =
                      JSON.parse(localStorage.getItem("memberData") || "{}") ||
                      {};
                    return md.rank || "";
                  } catch {
                    return "";
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSubHeader && (
        <div className="px-6 py-3">
          <h2 className="text-lg font-semibold text-gray-700">{pageTitle}</h2>
          <p className="text-xs text-gray-400">CUSTOMER ID: MLM-00484</p>
        </div>
      )}
    </div>
  );
}
