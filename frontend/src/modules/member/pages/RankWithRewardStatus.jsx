import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Star } from "lucide-react";

export default function RankWithRewardStatus() {
  const rewards = [
    {
      rank: "Rising Star",
      target: 5000,
      achieved: 0,
      pending: 5000,
      image: "/rewards/image.png",
    },
    {
      rank: "Bronze",
      target: 5000,
      achieved: 0,
      pending: 5000,
      image: "/rewards/image 6.png",
    },
    {
      rank: "Silver",
      target: 5000,
      achieved: 0,
      pending: 5000,
      image: "/rewards/image 7.png",
    },
    {
      rank: "Gold",
      target: 5000,
      achieved: 0,
      pending: 5000,
      image: "/rewards/image 8.png",
    },
    {
      rank: "Platinum",
      target: 5000,
      achieved: 0,
      pending: 5000,
      image: "/rewards/image 9.png",
    },
    {
      rank: "Diamond",
      target: 5000,
      achieved: 0,
      pending: 5000,
      image: "/rewards/image 10.png",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="p-6">

          <h1 className="text-3xl font-bold text-center text-[#B0422E] mb-6">
            Rank with Reward Status
          </h1>

          <div className="bg-[#B0422E] rounded-2xl p-6 text-white shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              <div className="bg-white/20 rounded-xl p-6">
                <p className="uppercase text-semibold">Total Target</p>
                <h2 className="text-2xl font-bold mt-2">₹430,000</h2>
              </div>

              <div className="bg-white/20 rounded-xl p-6">
                <p className="uppercase text-semibold">Total Achieved</p>
                <h2 className="text-2xl font-bold mt-2">₹0.00</h2>
              </div>

              <div className="bg-white/20 rounded-xl p-6">
                <p className="uppercase text-semibold">Ranks Achieved</p>
                <h2 className="text-2xl font-bold mt-2">0 / 6</h2>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm mt-6 p-6">

            <h2 className="text-lg font-semibold mb-4">
              Reward Tiers
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-245 text-sm">

                <thead>
                  <tr className="bg-[#B0422E] text-white text-semibold">
                    <th className="py-3 px-4 text-left rounded-l-xl">Sr No</th>
                    <th className="py-3 px-4 text-left">Rank</th>
                    <th className="py-3 px-4 text-left">Target</th>
                    <th className="py-3 px-4 text-left">Achieved</th>
                    <th className="py-3 px-4 text-left">Pending</th>
                    <th className="py-3 px-4 text-left">Progress</th>
                    <th className="py-3 px-4 text-left">Reward Bonus</th>
                    <th className="py-3 px-4 text-left rounded-r-xl">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {rewards.map((item, index) => {
                    const progress = 0;

                    return (
                      <tr key={index} className="border-b last:border-none">

                        <td className="py-6 px-4">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td className="py-6 px-4 flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Star size={14} className="text-blue-600" />
                          </div>
                          {item.rank}
                        </td>

                        <td className="py-6 px-4">₹{item.target}</td>
                        <td className="py-6 px-4">₹{item.achieved}</td>
                        <td className="py-6 px-4 text-[#F6A71E]">
                          ₹{item.pending}
                        </td>

                        <td className="py-6 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-gray-400 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {progress}%
                            </span>
                          </div>
                        </td>

                        <td className="py-6 px-4">
                          <img
                            src={item.image}
                            alt={item.rank}
                            className="w-20 h-20 object-contain"
                          />
                        </td>

                        <td className="py-6 px-4">
                          <span className="bg-yellow-100 text-yellow-600 px-4 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}