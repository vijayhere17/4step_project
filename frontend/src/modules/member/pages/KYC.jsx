import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function KYC() {
  const [step, setStep] = useState(1); // 1 = Bank Info, 2 = KYC Details

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-2xl font-bold text-[#B0422E]">
            My KYC with Bank Info
          </h1>

          <div className="flex justify-center items-center mt-6 px-4">
            <div className="flex items-center text-xs sm:text-sm overflow-x-auto max-w-full pb-2">

              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs 
                  ${step >= 1 ? "bg-blue-600" : "bg-gray-300"}`}>
                  1
                </div>
                <span className="mt-1 text-gray-600">Bank Info</span>
              </div>

              <div className={`w-24 h-0.5 mx-2 ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`} />

              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs 
                  ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}>
                  2
                </div>
                <span className="mt-1 text-gray-600">KYC Details</span>
              </div>

              <div className={`w-24 h-0.5 mx-2 ${step === 3 ? "bg-blue-600" : "bg-gray-300"}`} />

              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs 
                  ${step === 3 ? "bg-blue-600" : "bg-gray-300"}`}>
                  3
                </div>
                <span className="mt-1 text-gray-600">Submit</span>
              </div>

            </div>
          </div>
        </div>

        <div className="p-6">

          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-8">

              <h2 className="text-[#AE4329] font-bold mb-8">
                Bank Info
              </h2>

              <div className="space-y-8">

                {[
                  "Account Beneficiary Name*",
                  "Account No*",
                  "Re Enter Account No*",
                  "IFS Code*",
                  "Bank Name*",
                  "Branch Name*"
                ].map((label, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="sm:w-64 font-bold text-gray-600 ">
                      {label}
                    </label>
                    <input className="flex-1 border-b border-gray-300 outline-none py-1 focus:border-blue-600" />
                  </div>
                ))}

              </div>

              <div className="text-center mt-10">
                <button
                  onClick={() => setStep(2)}
                  className="bg-[#B0422E] hover:bg-[#B0422E] text-white px-8 py-2 rounded-md"
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm p-8">

              <h2 className="text-[#AE4329] font-bold mb-8">
                KYC Details
              </h2>

              <div className="space-y-8">

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-64 font-bold text-gray-600">
                    Aadhar Number*
                  </label>
                  <input className="flex-1 border-b border-gray-300 outline-none py-1 focus:border-blue-600" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-64 text-gray-600 font-bold">
                    PAN Number*
                  </label>
                  <input className="flex-1 border-b border-gray-300 outline-none py-1 focus:border-blue-600" />
                </div>

              </div>

              <div className="text-center mt-8">
                <button className="bg-[#B0422E] hover:bg-[#B0422E] text-white px-8 py-2 rounded-md">
                  Send OTP
                </button>
              </div>

              <div className="flex justify-center gap-3 sm:gap-4 mt-8 flex-wrap">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    maxLength="1"
                    className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg outline-none focus:border-blue-600"
                  />
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#B0422E] hover:bg-[#B0422E] text-white px-8 py-2 rounded-md"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <h2 className="text-green-600 text-xl font-semibold">
                KYC Submitted Successfully 🎉
              </h2>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
