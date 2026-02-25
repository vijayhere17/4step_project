import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import React from "react";

const Inbox = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
          <Sidebar />
    
          <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
            <Navbar />
            <div className="p-4 sm:p-6 bg-gray-100">

            <h1 className="text-3xl font-bold text-[#B0422E] text-center mb-8">
             Inbox
            </h1>

            <div className="bg-white rounded-2xl shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-center">

                                    <thead>
                                    <tr className="bg-[#B0422E] text-white">
                                    <th className="p-3 rounded-l-xl">Sr No</th>
                                    <th className="p-3">From</th>
                                    <th className="p-3">Subject</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 rounded-r-xl">Action</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    <tr className="border-b">
                                    <td className="p-4">01</td>
                                    <td>Admin</td>
                                    <td>Welcome to the platform!</td>
                                    <td>2026-02-14</td>
                                    <td>Read</td>
                                    <td className="text-[#256BB1] font-semibold">View</td>
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

export default Inbox;
