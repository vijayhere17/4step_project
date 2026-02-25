import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import React from "react";

const DiwaliCelebrationBonus = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
          <Sidebar />
    
          <div className="flex-1 min-w-0 flex flex-col">
            <Navbar />
            <div className="p-8 bg-gray-100 min-h-screen">

            <h1 className="text-3xl font-bold text-[#B0422E] text-center mb-8">
             Diwali Celebration Bonus
            </h1>

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-center">

                                    <thead>
                                    <tr className="bg-[#B0422E] text-white">
                                    <th className="p-3 rounded-l-xl">Sr No</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Transaction ID</th>
                                    <th className="p-3">Festival Year</th>
                                    <th className="p-3">Target Business</th>
                                    <th className="p-3">%</th>
                                    <th className="p-3">Earned</th>
                                    <th className="p-3 rounded-r-xl">Status</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    <tr className="border-b">
                                    <td className="p-4">01</td>
                                    <td>17-02-2026</td>
                                    <td>DB50012</td>
                                    <td>2025</td>
                                    <td>₹10,00,000</td>
                                    <td>2%</td>
                                    <td>₹12,500</td>
                                    <td className="text-green-600 font-semibold">Approved</td>
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

export default DiwaliCelebrationBonus;
