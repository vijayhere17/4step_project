import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ReferralPromoters() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-[#B0422E]">
            Referral Promoters
          </h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-md p-8">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="bg-[#B0422E] text-white font-semibold">
                    <th className="py-4 px-8 text-left rounded-l-xl">ID</th>
                    <th className="py-4 px-8 text-left">Activation Amount</th>
                    <th className="py-4 px-8 text-left">Days</th>
                    <th className="py-4 px-8 text-left">State</th>
                    <th className="py-4 px-8 text-left">City</th>
                    <th className="py-4 px-8 text-left">Sponsored Side</th>
                    <th className="py-4 px-8 text-left">Join Date</th>
                    <th className="py-4 px-8 text-left rounded-r-xl">
                      Activation Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-gray-300 font-medium">
                    <td className="py-6 px-8">
                      Bhagwati panchal ( FC9759640 )
                    </td>
                    <td className="py-6 px-8">1524</td>
                    <td className="py-6 px-8">--</td>
                    <td className="py-6 px-8">Gujarat</td>
                    <td className="py-6 px-8">Bharuch</td>
                    <td className="py-6 px-8">L</td>
                    <td className="py-6 px-8">17-02-2026</td>
                    <td className="py-6 px-8">25-02-2026</td>
                  </tr>
                </tbody>

              </table>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
