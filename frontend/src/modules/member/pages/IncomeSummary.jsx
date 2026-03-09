import { CalendarDays } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function IncomeSummary() {
  return (

    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
          <Sidebar />
    
              <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
            <Navbar />
            <div className="bg-gray-100 p-4 sm:p-6">
      
      <h1 className="text-3xl font-bold text-center text-[#b3432f] mb-8">
        Income Summary
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block font-medium mb-2">From date</label>
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3">
              <CalendarDays size={18} className="text-gray-500 mr-2" />
              <input
                type="date"
                className="bg-transparent outline-none w-full text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">To date</label>
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3">
              <CalendarDays size={18} className="text-gray-500 mr-2" />
              <input
                type="date"
                className="bg-transparent outline-none w-full text-gray-600"
              />
            </div>
          </div>
        </div>

        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg">
          Submit
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm  p-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#b3432f] text-white">
              <th className="px-4 py-3 text-left">Sr No</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Credit (₹)</th>
              <th className="px-4 py-3 text-left">Debit (₹)</th>
              <th className="px-4 py-3 text-left">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-4">01</td>
              <td className="px-4 py-4">17-02-2026</td>
              <td className="px-4 py-4">DB50012</td>
              <td className="px-4 py-4">₹500</td>
              <td className="px-4 py-4">--</td>
              <td className="px-4 py-4">₹500</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
    </div>
  );
}