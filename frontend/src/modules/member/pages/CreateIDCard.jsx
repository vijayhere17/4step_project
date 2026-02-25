import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function CreateIDCard() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">

        <Navbar
        
        />

        <div className="text-center mt-6">
          <h1 className="text-2xl font-bold text-[#B0422E]">
            Create ID Card
          </h1>
        </div>

        <div className="p-6">

          <div className="bg-white rounded-2xl border-2 border-white p-8">

            <div>
              <p className="text-gray-700 font-medium mb-3">
                Upload Photo :
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm flex items-center gap-2 shadow-sm">

                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4"
                    />
                  </svg>

                  Choose File

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-gray-400">
                  Max. file size allowed : 2 MB | Only upload image JPG/PNG/GIF
                </p>
              </div>

              {fileName && (
                <p className="text-sm text-gray-600 mt-3">
                  Selected: {fileName}
                </p>
              )}

              <div className="mt-6">
                <button className="bg-red-700 hover:bg-red-800 text-white px-8 py-2 rounded-md">
                  Submit
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}