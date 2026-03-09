import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import React from "react";

const EarningBalanceHistory = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
          <Sidebar />
    
          <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
            <Navbar />
            <div className="p-4 sm:p-6 bg-gray-100">

            <h1 className="text-3xl font-bold text-[#B0422E] text-center mb-8">
             Earning Balance History
            </h1>

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-center">

                                    <thead>
                                    <tr className="bg-[#B0422E] text-white">
                                    <th className="p-3 rounded-l-xl">Sr No</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Credit (₹)</th>
                                    <th className="p-3">Debit (₹)</th>
                                    <th className="p-3">Balance (₹)</th>
                                    <th className="p-3 rounded-r-xl">Status</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    <tr className="border-b">
                                    <td className="p-4">01</td>
                                    <td>17-02-2026</td>
                                    <td>Group Built-Up Bonus</td>
                                    <td>Mumbai</td>
                                    <td>₹40,00,000</td>
                                    <td>₹1,20,000</td>
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

export default EarningBalanceHistory;
