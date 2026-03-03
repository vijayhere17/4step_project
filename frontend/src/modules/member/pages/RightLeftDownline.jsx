import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ReferralLeftRight() {
  const [leftData, setLeftData] = useState([]);
  const [rightData, setRightData] = useState([]);

  useEffect(() => {
    fetchDownline();
  }, []);

  const fetchDownline = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:8000/api/downline", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log(res.data);

    setLeftData(res.data.left || []);
    setRightData(res.data.right || []);
  } catch (error) {
    console.error("Error fetching downline:", error);
  }
};

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-xl font-bold text-[#B0422E]">
            Left-Right Downline
          </h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 font-medium">

            <Table title="Left Associates" data={leftData} />

            <Table title="Right Associates" data={rightData} />

          </div>
        </div>
      </div>
    </div>
  );
}

function Table({ title, data = [] }) {
  return (
    <div>
      <h2 className="font-semibold mb-3">{title}</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="bg-[#B0422E] text-white">
              <th className="py-3 px-4 text-left rounded-l-xl">Date</th>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">State</th>
              <th className="py-3 px-4 text-left">City</th>
              <th className="py-3 px-4 text-left rounded-r-xl">Activation</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((member, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {member.created_at
                      ? new Date(member.created_at).toLocaleDateString()
                      : "--"}
                  </td>
                  <td className="py-3 px-4">{member.user_id || "--"}</td>
                  <td className="py-3 px-4">{member.state || "--"}</td>
                  <td className="py-3 px-4">{member.city || "--"}</td>
                  <td className="py-3 px-4">
                    {member.activation ? "Activated" : "Inactive"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No Members Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}