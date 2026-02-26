import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FaUser } from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

/* ============================
   NODE COMPONENT
============================ */
const TreeNode = ({ node }) => {
  return (
    <div className="flex flex-col items-center relative">

      {/* Node Box */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm
        ${
          node?.status === 1
            ? "bg-green-100 text-green-600"
            : node
            ? "bg-red-100 text-red-600"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <FaUser />
      </div>

      {/* Node Text */}
      {node && (
        <div className="text-xs text-center mt-2">
          <p className="font-medium">{node.user_id}</p>
          <p className="text-gray-500">{node.fullname}</p>
        </div>
      )}

      {/* Children */}
      {(node?.left || node?.right) && (
        <div className="flex flex-col items-center mt-8 relative">

          {/* Vertical Line */}
          <svg width="2" height="30">
            <line x1="1" y1="0" x2="1" y2="30" stroke="#cbd5e1" strokeWidth="2" />
          </svg>

          {/* Horizontal Line */}
          <div className="relative flex justify-center gap-32">

            <svg
              className="absolute -top-4"
              width="100%"
              height="20"
              preserveAspectRatio="none"
            >
              <line
                x1="25%"
                y1="10"
                x2="75%"
                y2="10"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
            </svg>

            {/* LEFT CHILD */}
            <div className="flex flex-col items-center">
              <svg width="2" height="20">
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="20"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
              </svg>
              <TreeNode node={node.left} />
            </div>

            {/* RIGHT CHILD */}
            <div className="flex flex-col items-center">
              <svg width="2" height="20">
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="20"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
              </svg>
              <TreeNode node={node.right} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================
   MAIN PAGE
============================ */
export default function BuiltupTree() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const memberData = JSON.parse(
          localStorage.getItem("memberData") || "{}"
        );

        const res = await fetch(`${API_BASE_URL}/member/tree`, {
          headers: {
            Accept: "application/json",
            "X-Auth-Member": memberData.user_id,
          },
        });

        const data = await res.json();
        setTree(data.tree);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar pageTitle="Builtup Tree" />

        <div className="p-6">

          <h1 className="text-center text-3xl font-semibold text-[#B0422E] mb-6">
            Builtup Tree
          </h1>

          <div className="bg-white rounded-2xl shadow-sm p-10 relative overflow-x-auto">

            {/* Search Section */}
            <div className="flex justify-center gap-4 mb-10">
              <span className="text-gray-600">Search Associate :</span>
              <input className="bg-gray-100 px-4 py-2 rounded-md outline-none" />
              <button className="bg-[#B0422E] text-white px-5 py-2 rounded-md">
                Add Address
              </button>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 mb-12 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  <FaUser />
                </div>
                <span className="mt-2 text-gray-500">Empty</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                  <FaUser />
                </div>
                <span className="mt-2 text-gray-500">In Process</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <FaUser />
                </div>
                <span className="mt-2 text-gray-500">Active</span>
              </div>
            </div>

            {/* Left Stats */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm space-y-1">
              <p>Left : 0</p>
              <p>Left PV : 0</p>
              <p>Left BV : 0</p>
            </div>

            {/* Right Stats */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm text-right space-y-1">
              <p>Right : 0</p>
              <p>Right PV : 0</p>
              <p>Right BV : 0</p>
            </div>

            {/* TREE RENDER */}
            {loading ? (
              <div className="text-center text-gray-500">
                Loading tree...
              </div>
            ) : tree ? (
              <div className="flex justify-center min-w-[900px]">
                <TreeNode node={tree} />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                No Tree Data Found
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}