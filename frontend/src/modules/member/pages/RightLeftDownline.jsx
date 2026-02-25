import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ReferralLeftRight() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-xl font-bold text-[#B0422E]">
            Left-Right Downline          
            </h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 font-medium">

            <Table title="Left Associates" />

            <Table title="Right Associates" />

          </div>
        </div>
      </div>
    </div>
  );
}

function Table({ title }) {
  return (
    <div>
      <h2 className="font-semibold mb-3">{title}</h2>

      <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-sm">
        <thead>
          <tr className="bg-[#B0422E] text-white ">
            <th className="py-3 px-4 text-left rounded-l-xl">Date</th>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">State</th>
            <th className="py-3 px-4 text-left">City</th>
            <th className="py-3 px-4 text-left rounded-r-xl">Activation</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <td className="py-3 px-4">17-02-2026</td>
            <td className="py-3 px-4">FC9747393</td>
            <td className="py-3 px-4">Banswara</td>
            <td className="py-3 px-4">--</td>
            <td className="py-3 px-4">--</td>
          </tr>

          <tr className="border-b">
            <td className="py-3 px-4">17-02-2026</td>
            <td className="py-3 px-4">FC9747393</td>
            <td className="py-3 px-4">Banswara</td>
            <td className="py-3 px-4">--</td>
            <td className="py-3 px-4">--</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}