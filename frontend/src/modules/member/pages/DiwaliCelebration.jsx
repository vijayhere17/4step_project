import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DiwaliCelebration() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        {/* Page Title */}
        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-[#B0422E]">
            Diwali Celebration
          </h1>
        </div>

        <div className="p-6 space-y-6">

          {/* Top Summary Card */}
          <div className="bg-[#B0422E] rounded-2xl p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

              {/* Total Matching */}
              <div className="bg-[#CF9D94A1] rounded-xl p-6 text-white">
                <p className="uppercase text-semibold tracking-wide">
                  Total Matching
                </p>
                <h2 className="text-2xl font-bold mt-2">₹0.00</h2>
              </div>

              {/* Qualified Matching */}
              <div className="bg-[#CF9D94A1] rounded-xl p-6 text-white">
                <p className="uppercase text-semibold tracking-wide">
                  Qualified Matching
                </p>
                <h2 className="text-2xl font-bold mt-2">₹0.00</h2>
              </div>

              {/* Lapsed Matching */}
              <div className="bg-[#CF9D94A1] rounded-xl p-6 text-white">
                <p className="uppercase text-semibold tracking-wide">
                  Lapsed Matching
                </p>
                <h2 className="text-2xl font-bold mt-2">₹0.00</h2>
              </div>

            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
            <table className="w-full min-w-175 text-semibold">
              <thead>
                <tr className="bg-[#B0422E] text-white">
                  <th className="py-3 px-4 text-left rounded-l-xl">
                    Sr No
                  </th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Left BV</th>
                  <th className="py-3 px-4 text-left">Right BV</th>
                  <th className="py-3 px-4 text-left">Matching</th>
                  <th className="py-3 px-4 text-left rounded-r-xl">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-gray-400 font-medium"
                  >
                    No Record Found...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}