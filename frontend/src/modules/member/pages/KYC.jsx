import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function KYC() {
  const [step, setStep] = useState(1); // 1 = Bank Info, 2 = KYC Details
  const [isBankReadOnly, setIsBankReadOnly] = useState(false);
  const [isIdentityReadOnly, setIsIdentityReadOnly] = useState(false);
  const [bankPassbookFile, setBankPassbookFile] = useState(null);
  const [aadhaarCardFile, setAadhaarCardFile] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    account_beneficiary_name: "",
    account_no: "",
    re_account_no: "",
    ifs_code: "",
    bank_name: "",
    branch_name: "",
    aadhar_number: "",
    pan_number: "",
  });

  useEffect(() => {
    const loadKyc = async () => {
      setIsLoading(true);
      setError("");

      let memberData = {};
      try {
        memberData = JSON.parse(localStorage.getItem("memberData") || "{}") || {};
      } catch {
        memberData = {};
      }

      if (!memberData?.user_id) {
        setIsLoading(false);
        setError("Please sign in first");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/member/kyc?user_id=${encodeURIComponent(memberData.user_id)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data?.message || "Unable to load KYC");
          return;
        }

        const kycData = data?.kyc || data;

        if (kycData?.id) {
          setIsBankReadOnly(true);
          setIsIdentityReadOnly(Boolean(kycData.aadhar_number && kycData.pan_number));
          setForm({
            account_beneficiary_name: kycData.account_beneficiary_name || "",
            account_no: kycData.account_no || "",
            re_account_no: kycData.account_no || "",
            ifs_code: kycData.ifs_code || "",
            bank_name: kycData.bank_name || "",
            branch_name: kycData.branch_name || "",
            aadhar_number: kycData.aadhar_number || "",
            pan_number: kycData.pan_number || "",
          });
        }
      } catch {
        setError("Unable to connect to backend");
      } finally {
        setIsLoading(false);
      }
    };

    loadKyc();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePassbookChange = (e) => {
    const file = e.target.files?.[0] || null;
    setBankPassbookFile(file);
  };

  const handleAadhaarCardChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAadhaarCardFile(file);
  };

  const handlePanCardChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPanCardFile(file);
  };

  const renderUploadContainer = ({ id, file, onChange, disabled }) => (
    <div className={`flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 ${disabled ? "opacity-80" : ""}`}>
      <input
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
      <label
        htmlFor={id}
        className={`inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-400" : "cursor-pointer bg-white text-gray-700 hover:bg-gray-100"}`}
      >
        Choose File
      </label>
      <span className="text-sm text-gray-500 truncate">
        {file ? file.name : "No file chosen"}
      </span>
    </div>
  );

  const goToStep2 = () => {
    setError("");
    setMessage("");

    if (
      !form.account_beneficiary_name ||
      !form.account_no ||
      !form.re_account_no ||
      !form.ifs_code ||
      !form.bank_name ||
      !form.branch_name
    ) {
      setError("Please fill all Bank Info fields");
      return;
    }

    if (form.account_no !== form.re_account_no) {
      setError("Account numbers do not match");
      return;
    }

    if (!isBankReadOnly && !bankPassbookFile) {
      setError("Please upload your bank passbook details");
      return;
    }

    setStep(2);
  };

  const submitKyc = async () => {
    setError("");
    setMessage("");

    if (!form.aadhar_number || !form.pan_number) {
      setError("Please fill Aadhar and PAN Number");
      return;
    }

    if (!isIdentityReadOnly && (!aadhaarCardFile || !panCardFile)) {
      setError("Please upload Aadhaar and PAN card photos");
      return;
    }

    let memberData = {};
    try {
      memberData = JSON.parse(localStorage.getItem("memberData") || "{}") || {};
    } catch {
      memberData = {};
    }

    if (!memberData?.user_id) {
      setError("Please sign in first");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/member/kyc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_id: memberData.user_id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Unable to save KYC");
        return;
      }

      setMessage("KYC saved successfully");
      setIsBankReadOnly(true);
      setIsIdentityReadOnly(true);
      setStep(3);
    } catch {
      setError("Unable to connect to backend");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-2xl font-bold text-[#B0422E]">
            My KYC with Bank Info
          </h1>
          {isLoading && <p className="text-sm text-gray-500 mt-2">Loading KYC...</p>}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          {message && <p className="text-sm text-green-600 mt-2">{message}</p>}

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
                  { label: "Account Beneficiary Name*", name: "account_beneficiary_name" },
                  { label: "Account No*", name: "account_no" },
                  { label: "Re Enter Account No*", name: "re_account_no" },
                  { label: "IFS Code*", name: "ifs_code" },
                  { label: "Bank Name*", name: "bank_name" },
                  { label: "Branch Name*", name: "branch_name" }
                ].map((field) => (
                  <div key={field.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="sm:w-64 font-bold text-gray-600 ">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      readOnly={isBankReadOnly}
                      className={`flex-1 border-b border-gray-300 outline-none py-1 ${isBankReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:border-blue-600"}`}
                    />
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-64 font-bold text-gray-600">
                    Upload Bank Passbook Front Page Or Cancel Check Photo*
                  </label>
                  <div className="flex-1">
                    {renderUploadContainer({
                      id: "bank-passbook-photo",
                      file: bankPassbookFile,
                      onChange: handlePassbookChange,
                      disabled: isBankReadOnly,
                    })}
                  </div>
                </div>

              </div>

              <div className="text-center mt-10">
                <button
                  onClick={goToStep2}
                  className="bg-[#B0422E] hover:bg-[#B0422E] text-white px-8 py-2 rounded-md"
                >
                  {isBankReadOnly ? "Continue" : "Update"}
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
                  <input
                    name="aadhar_number"
                    value={form.aadhar_number}
                    onChange={handleChange}
                    readOnly={isIdentityReadOnly}
                    className={`flex-1 border-b border-gray-300 outline-none py-1 ${isIdentityReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:border-blue-600"}`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-64 font-bold text-gray-600">
                    Upload Aadhaar Card Front And Back Page  Photo*
                  </label>
                  <div className="flex-1">
                    {renderUploadContainer({
                      id: "aadhaar-card-photo",
                      file: aadhaarCardFile,
                      onChange: handleAadhaarCardChange,
                      disabled: isIdentityReadOnly,
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-64 text-gray-600 font-bold">
                    PAN Number*
                  </label>
                  <input
                    name="pan_number"
                    value={form.pan_number}
                    onChange={handleChange}
                    readOnly={isIdentityReadOnly}
                    className={`flex-1 border-b border-gray-300 outline-none py-1 ${isIdentityReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:border-blue-600"}`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-64 text-gray-600 font-bold">
                    Upload PAN Card Front Page  Photo*
                  </label>
                  <div className="flex-1">
                    {renderUploadContainer({
                      id: "pan-card-photo",
                      file: panCardFile,
                      onChange: handlePanCardChange,
                      disabled: isIdentityReadOnly,
                    })}
                  </div>
                </div>

              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setMessage("OTP sent (demo)")}
                  className="bg-[#B0422E] hover:bg-[#B0422E] text-white px-8 py-2 rounded-md"
                >
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
                  onClick={submitKyc}
                  disabled={isSaving}
                  className="bg-[#B0422E] hover:bg-[#B0422E] text-white px-8 py-2 rounded-md"
                >
                  {isSaving ? "Saving..." : "Submit"}
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
