import { Send } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ComposeMessage() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="p-4 sm:p-6">
          <h1 className="text-3xl font-bold text-center text-[#B0422E] mb-6 sm:mb-8">
            Compose a Message
          </h1>

          <div className="bg-white rounded-2xl shadow-sm  p-5 sm:p-8">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                <label className="md:col-span-2 font-semibold text-[#000000]">
                  Send To<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="md:col-span-10 h-11 w-full bg-gray-100 rounded-xl px-4 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                <label className="md:col-span-2 font-semibold text-[#000000]">
                  Subject<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="md:col-span-10 h-11 w-full bg-gray-100 rounded-xl px-4 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start">
                <label className="md:col-span-2 font-semibold pt-2 text-[#000000]">
                  Message Details<span className="text-red-500">*</span>
                </label>

                <div className="md:col-span-10">
                  <div className="h-11 bg-gray-100 rounded-xl px-4 flex items-center gap-3 sm:gap-5 text-gray-700 border-b border-gray-300 overflow-x-auto whitespace-nowrap">
                    <span className="text-sm">A Normal text</span>
                    <span className="font-semibold">Black</span>
                    <span className="text-xl leading-none">|</span>
                    <span className="font-semibold underline">U</span>
                    <span className="font-semibold italic">I</span>
                    <span className="font-bold text-lg">B</span>
                    <span className="text-xl leading-none">|</span>
                    <span>≡</span>
                    <span>≡</span>
                    <span>≡</span>
                    <span className="text-xl leading-none">|</span>
                    <span>🔗</span>
                    <span>🖼</span>
                  </div>

                  <textarea
                    rows="12"
                    className="w-full bg-gray-100 rounded-xl mt-4 p-4 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 sm:px-10 py-2.5 rounded-xl font-semibold">
                <Send size={16} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}