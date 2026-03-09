import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import React from "react";

const EarningBalanceWithdrawal = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
          <Sidebar />
    
          <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
            <Navbar />
            <div className="p-4 sm:p-6 bg-gray-100">

            <h1 className="text-3xl font-bold text-[#B0422E] text-center mb-8">
             Earning Balance Withdrawal
            </h1>

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-center">

                                    <thead>
                                    <tr className="bg-[#B0422E] text-white">
                                    <th className="p-3 rounded-l-xl">Sr No</th>
                                    <th className="p-3">Payment Date</th>
                                    <th className="p-3">Payment Amount</th>
                                    <th className="p-3">Reference No.</th>
                                    <th className="p-3 rounded-r-xl">Status</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    <tr className="border-b">
                                    <td className="p-4">01</td>
                                    <td>17-02-2026</td>
                                    <td>DB50012</td>
                                    <td>Platinum Leader</td>
                                    <td>17-02-2026</td>
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

export default EarningBalanceWithdrawal;
