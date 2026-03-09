import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function PurchaseBalanceHistory() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-[#B0422E]">
            Purchase Balance History
          </h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">

            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="bg-[#B0422E] text-white">
                  <th className="py-3 px-4 text-left rounded-l-xl">
                    Request No
                  </th>
                  <th className="py-3 px-4 text-left">Request Date</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Payment Mode</th>
                  <th className="py-3 px-4 text-left">
                    Transaction Number
                  </th>
                  <th className="py-3 px-4 text-left">Slip</th>
                  <th className="py-3 px-4 text-left rounded-r-xl">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4">01</td>
                  <td className="py-4 px-4">17-02-2026</td>
                  <td className="py-4 px-4">4999₹</td>
                  <td className="py-4 px-4">Online</td>
                  <td className="py-4 px-4">4813181</td>
                  <td className="py-4 px-4">AST</td>
                  <td className="py-4 px-4">Succeed</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}
