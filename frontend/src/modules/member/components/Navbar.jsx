import { LuPanelLeftDashed } from "react-icons/lu";
import { MdSupervisorAccount } from "react-icons/md";
import { useEffect, useState } from "react";

export default function Navbar({ pageTitle = "Dashboard" }) {

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

    <header className="h-16 bg-white border-b flex items-center justify-between px-6">

      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <LuPanelLeftDashed />
          {pageTitle}
        </h1>

        <p className="text-xs text-gray-400">
          CUSTOMER ID:
          {(() => {
            try {
              const md =
                JSON.parse(localStorage.getItem("memberData") || "{}") || {};
              return md.user_id ? ` MLM-${md.user_id}` : "-";
            } catch {
              return "-";
            }
          })()}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        <div className="text-sm text-gray-600 hidden md:block">
          <p>
            <MdSupervisorAccount className="inline mr-1" />
            Left Members: <b>{stats.left_members}</b>
          </p>

          <p>
            <MdSupervisorAccount className="inline mr-1" />
            Right Members: <b>{stats.right_members}</b>
          </p>
        </div>

        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="w-9 h-9 rounded-full border"
        />

      </div>

    </header>
  );
}