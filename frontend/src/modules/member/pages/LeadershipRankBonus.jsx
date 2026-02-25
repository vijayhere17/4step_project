import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import React from "react";

const LeadershipRankBonus = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
          <Sidebar />
    
          <div className="flex-1 min-w-0 flex flex-col">
            <Navbar />
            <div className="p-8 bg-gray-100 min-h-screen">

            <h1 className="text-3xl font-bold text-[#B0422E] text-center mb-8">
             Leadership Rank Bonus
            </h1>

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-center">

                                    <thead>
                                    <tr className="bg-[#B0422E] text-white">
                                    <th className="p-3 rounded-l-xl">Sr No</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Transaction ID</th>
                                    <th className="p-3">Rank Name</th>
                                    <th className="p-3">Rank Achieved Date</th>
                                    <th className="p-3">Business Volume</th>
                                    <th className="p-3">Earned</th>
                                    <th className="p-3 rounded-r-xl">Status</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    <tr className="border-b">
                                    <td className="p-4">01</td>
                                    <td>17-02-2026</td>
                                    <td>DB50012</td>
                                    <td>Feb 2026</td>
                                    <td>17-02-2026</td>
                                    <td>₹25,00,000</td>
                                    <td>₹50,000</td>
                                    <td className="text-green-600 font-semibold">Pending</td>
                                 </tr>
                             </tbody>

                        </table>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default LeadershipRankBonus;
