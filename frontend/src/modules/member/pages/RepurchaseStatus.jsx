import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { IndianRupee } from "lucide-react";

export default function RepurchaseStatus() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-[#B0422E]">
            Repurchase Status
          </h1>
        </div>

        <div className="p-6 space-y-6">

          <div className="bg-[#B0422E] rounded-2xl p-8 text-white shadow-md">

            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl">
                <IndianRupee size={28} />
              </div>
              <div>
                <p className="uppercase text-semibold tracking-wide">
                  Repurchase Balance
                </p>
                <h2 className="text-3xl font-bold">₹5,550</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[#CF9D94A1] rounded-xl p-6">
                <p className="uppercase text-semibold text-[#FFFFFFAD]">Total Credit</p>
                <h3 className="text-2xl font-semibold mt-2">₹ 10,000</h3>
              </div>

              <div className="bg-[#CF9D94A1] rounded-xl p-6">
                <p className="uppercase text-semibold text-[#FFFFFFAD]">Total Debit</p>
                <h3 className="text-2xl font-semibold mt-2">₹ 10,000</h3>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="bg-[#B0422E] text-white">
                  <th className="py-3 px-4 text-left rounded-l-xl">
                    Sr No
                  </th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Detail</th>
                  <th className="py-3 px-4 text-left">
                    Credit Amount
                  </th>
                  <th className="py-3 px-4 text-left">
                    Debit Amount
                  </th>
                  <th className="py-3 px-4 text-left rounded-r-xl">
                    Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4">01</td>
                  <td className="py-4 px-4">17-02-2026</td>
                  <td className="py-4 px-4">
                    Purchase Balance Added
                  </td>
                  <td className="py-4 px-4">₹5000</td>
                  <td className="py-4 px-4">--</td>
                  <td className="py-4 px-4">₹5000</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
