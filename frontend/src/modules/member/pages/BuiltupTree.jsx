import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FaUser } from "react-icons/fa";

const Node = ({ name, id, active }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm
        ${active ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}
      >
        <FaUser />
      </div>
      {name && (
        <div className="text-xs text-center mt-2">
          <p className="font-medium">{id}</p>
          <p className="text-gray-500">{name}</p>
        </div>
      )}
    </div>
  );
};

export default function BuiltupTree() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="p-6">

          <h1 className="text-center text-3xl font-semibold text-[#B0422E] mb-6">
            Builtup Tree
          </h1>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 relative overflow-x-auto">

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
              <span className="text-gray-600">Search Associate :</span>
              <input className="bg-gray-100 px-4 py-2 rounded-md outline-none" />
              <button className="bg-[#B0422E] text-white px-5 py-2 rounded-md">
                Add Address
              </button>
            </div>

            <div className="flex justify-center gap-4 sm:gap-8 mb-16 flex-wrap">
              <div className="flex flex-col items-center text-sm">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  <FaUser />
                </div>
                <span className="mt-2 text-gray-500">Empty</span>
              </div>

              <div className="flex flex-col items-center text-sm">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                  <FaUser />
                </div>
                <span className="mt-2 text-gray-500">In Process</span>
              </div>

              <div className="flex flex-col items-center text-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <FaUser />
                </div>
                <span className="mt-2 text-gray-500">Active</span>
              </div>
            </div>

            <div className="font-bold hidden xl:block absolute left-10 top-1/2 -translate-y-1/2 text-blue-600 text-sm space-y-1">
              <p>Left : 0</p>
              <p>Left PV : 0</p>
              <p>Left BV : 0</p>
            </div>

            <div className=" font-bold hidden xl:block absolute right-10 top-1/2 -translate-y-1/2 text-blue-600 text-sm space-y-1 text-right">
              <p>Right : 0</p>
              <p>Right PV : 0</p>
              <p>Right BV : 0</p>
            </div>

            <div className="min-w-175 flex flex-col items-center space-y-16">

              <Node
                id="CFJU23562"
                name="Maruti B Jadhav"
                active={false}
              />

              <div className="flex justify-center gap-40 relative">
                <Node />
                <Node />
              </div>

              <div className="flex justify-center gap-28">
                <div className="flex gap-16">
                  <Node />
                  <Node />
                </div>
                <div className="flex gap-16">
                  <Node />
                  <Node />
                </div>
              </div>

              <div className="flex justify-center gap-16">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Node key={i} />
                ))}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
