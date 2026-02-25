import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MatchingStatus() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        
        <div className="text-center mt-6">
          <h1 className="text-3xl font-bold text-[#B0422E]">
            Matching Status
          </h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-md p-8">

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">

                <thead>
                  <tr className="bg-[#B0422E] text-[#FFFFFF] font-semibold">
                    <th
                      rowSpan="2"
                      className="py-4 px-6 rounded-l-xl"
                    >
                      Sr No
                    </th>
                    <th rowSpan="2" className="py-4 px-6">
                      Date
                    </th>

                    <th colSpan="2" className="py-4 px-6 border-l border-white/40">
                      Forward
                    </th>

                    <th colSpan="2" className="py-4 px-6 border-l border-white/40">
                      Current
                    </th>

                    <th colSpan="2" className="py-4 px-6 border-l border-white/40">
                      Total
                    </th>

                    <th
                      rowSpan="2"
                      className="py-4 px-6 border-l border-white/40"
                    >
                      Total Matching
                    </th>

                    <th
                      rowSpan="2"
                      className="py-4 px-6 rounded-r-xl border-l border-white/40"
                    >
                      Qualified Matching
                    </th>
                  </tr>

                  <tr className="bg-[#B0422E] text-white font-semibold">
                    <th className="py-3 px-6 border-l border-white/40">Left</th>
                    <th className="py-3 px-6">Right</th>

                    <th className="py-3 px-6 border-l border-white/40">Left</th>
                    <th className="py-3 px-6">Right</th>

                    <th className="py-3 px-6 border-l border-white/40">Left</th>
                    <th className="py-3 px-6">Right</th>
                  </tr>
                </thead>

                <tbody className="text-[#000000] font-medium">
                  <tr className="border-b border-gray-300">
                    <td className="py-5">01</td>
                    <td>Current</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>--</td>
                    <td>--</td>
                  </tr>

                  <tr className="border-b border-gray-300">
                    <td className="py-5">02</td>
                    <td>Current</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>--</td>
                    <td>--</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center font-semibold text-[#151D28]">
              Total
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}