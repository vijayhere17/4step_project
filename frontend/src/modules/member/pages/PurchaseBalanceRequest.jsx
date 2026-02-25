import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Building2, IndianRupee, CreditCard, Upload } from "lucide-react";

export default function PurchaseBalanceRequest() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-[#B0422E]">
            Purchase Balance Request
          </h1>
        </div>

        <div className="p-6 space-y-6">

          <div className="bg-[#B0422E] rounded-2xl p-8 text-white shadow-md">

            <div className="flex items-center gap-3 mb-6">
              <Building2 size={24} />
              <h2 className="text-xl font-semibold">
                ICICI BANK - Transfer Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[1,2,3,4].map((item) => (
                <div
                  key={item}
                  className="bg-white/20 rounded-xl p-4"
                >
                  <p className="text-sm uppercase">
                    Account Name
                  </p>
                  <h3 className="font-semibold mt-1">
                    FOURSTEP RETAIL LIMITED
                  </h3>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <IndianRupee size={16} />
                  Enter Amount*
                </label>
                <input
                  type="text"
                  placeholder="Min ₹500"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B0422E]"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <CreditCard size={16} />
                  Mode of Payment*
                </label>
                <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B0422E]">
                  <option>By Online Payment</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Transaction No.
                </label>
                <input
                  type="text"
                  placeholder="By Online Payment"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B0422E]"
                />
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Upload size={16} />
                  Payment Slip
                </label>
                <input
                  type="file"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

            </div>

            <hr />

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <p className="text-[#0000005C] text-medium">
                * Minimum Amount ₹500 allowed for Purchase Balance request
              </p>

              <button className="bg-[#B0422E] text-white px-6 py-2 rounded-lg hover:bg-[#963826] transition">
                Submit Request
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
