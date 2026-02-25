import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const FamilySaverBonus = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

      <Sidebar />   
        <div className="flex-1 min-w-0 flex flex-col">
            <Navbar />

    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold text-[#B0422E] text-center mb-8">
        Family Saver Bonus
      </h1>

      <div className="bg-white rounded-2xl shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-center">

            <thead>
              <tr className="bg-[#B0422E] text-white">
                <th className="p-3 rounded-l-xl">Sr No</th>
                <th className="p-3">Date</th>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Family ID</th>
                <th className="p-3">Combined Business</th>
                <th className="p-3">Qualification Status</th>
                <th className="p-3">Earned</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl">Wallet</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="p-4">01</td>
                <td>17-02-2026</td>
                <td>DB50012</td>
                <td>FAM1021</td>
                <td>₹6,00,000</td>
                <td>Qualified</td>
                <td>₹12,000</td>
                <td className="text-green-600 font-semibold">Approved</td>
                <td className="text-blue-600 font-semibold">Credited</td>
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

export default FamilySaverBonus;