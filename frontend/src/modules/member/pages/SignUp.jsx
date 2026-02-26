import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function SignUp() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasQuery = params.has("sponsorId") || params.has("position");
    // if already signed in and no referral query, go straight to dashboard
    if (localStorage.getItem("memberSession") && !hasQuery) {
      navigate("/member/dashboard");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    sponsorId: "",
    position: "",
    fullname: "",
    dob: "",
    gender: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
    address: "",
    pinCode: "",
    state: "",
    city: "",
    district: "",
    agreeTerms: false,
    ageConfirmed: false,
  });

  const [sponsorName, setSponsorName] = useState("");
  const [sponsorError, setSponsorError] = useState("");
  const [fixedSponsor, setFixedSponsor] = useState(false);
  const [fixedPosition, setFixedPosition] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let newErrors = {};

    // regular expressions for common formats
    const emailRegex = /^\S+@\S+\.\S+$/;
    const mobileRegex = /^[0-9]{10}$/;
    const pinCodeRegex = /^[0-9]{6}$/;

    if (!formData.sponsorId.trim()) {
      newErrors.sponsorId = "Sponsor ID is required";
    }

    if (!formData.position) {
      newErrors.position = "Placement (Left/Right) is required";
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      // verify age >= 18
      const birth = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dob = "You must be at least 18 years old";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (formData.email && !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!mobileRegex.test(formData.mobileNo.trim())) {
      newErrors.mobileNo = "Enter a valid 10‑digit mobile number";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.pinCode && !pinCodeRegex.test(formData.pinCode.trim())) {
      newErrors.pinCode = "Pin code must be 6 digits";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms";
    }

    if (!formData.ageConfirmed) {
      newErrors.ageConfirmed = "Please confirm your age";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("sponsorId");
      const p = params.get("position");
      if (s) {
        setFormData((prev) => ({ ...prev, sponsorId: s }));
        checkSponsor(s);
        setFixedSponsor(true);
      }
      if (p) {
        setFormData((prev) => ({ ...prev, position: p }));
        setFixedPosition(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // normalize
    if (name === "mobileNo" || name === "pinCode") {
      newValue = newValue.replace(/\D/g, "");
    }

    // allow only digits for mobile and pincode
    if (name === "mobileNo" || name === "pinCode") {
      // strip non-digits
      newValue = newValue.replace(/\D/g, "");
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const checkSponsor = async (id) => {
    setSponsorName("");
    setSponsorError("");
    if (!id || !id.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/member/check-sponsor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ sponsorId: id }),
      });
      if (!res.ok) {
        setSponsorError("Sponsor not found or inactive");
        return;
      }
      const data = await res.json();
      setSponsorName(data.sponsor.fullname || data.sponsor.user_id);
    } catch (err) {
      setSponsorError("Unable to verify sponsor");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError("");

    if (validateForm()) {
      signupMember();
    }
  };

  const signupMember = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/member/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.errors) {
          const mappedErrors = {};
          Object.entries(data.errors).forEach(([key, value]) => {
            mappedErrors[key] = Array.isArray(value) ? value[0] : value;
          });
          setErrors((prev) => ({ ...prev, ...mappedErrors }));
        }
        setApiError(data?.message || "Signup failed. Please try again.");
        return;
      }

      alert(`Signup Successful\nMember ID: ${data.member.user_id}`);

      // store session so user is immediately logged in
      localStorage.setItem("memberSession", "true");
      localStorage.setItem("memberData", JSON.stringify(data.member || {}));
      navigate("/member/dashboard");
    } catch (error) {
      setApiError(
        "Unable to connect to server. Please check backend is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-3xl ">
        {/* logo */}
        <div className="text-center mb-6 mt-6">
          <img
            src="/images/ecom/4steplogo.png"
            className="mx-auto h-20"
            alt="logo"
          />

          <div className=" p-2 overflow-hidden rounded-xl text-center mb-4 mt-4 bg-[#8b5e3c]">
            <h1 className="text-3xl font-semibold text-white ">Sign up</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sponsor / Placement */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="text-[#AE4329] text-lg font-bold mb-3">Sponsor</h3>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="text-black text-sm font-medium mb-2">
                  Sponsor ID
                </label>
                <div className="flex items-center border-b">
                  <input
                    name="sponsorId"
                    value={formData.sponsorId}
                    readOnly={fixedSponsor}
                    onChange={(e) => {
                      if (!fixedSponsor) {
                        handleChange(e);
                        setSponsorName("");
                        setSponsorError("");
                      }
                    }}
                    onBlur={(e) =>
                      !fixedSponsor && checkSponsor(e.target.value)
                    }
                    placeholder="Enter Sponsor ID"
                    className={`w-full py-2 outline-none text-sm ${
                      fixedSponsor ? "bg-gray-100" : ""
                    }`}
                  />
                </div>
                {sponsorName && (
                  <p className="text-sm text-green-600 mt-1">
                    Sponsor: {sponsorName}
                  </p>
                )}
                {sponsorError && (
                  <p className="text-sm text-red-500 mt-1">{sponsorError}</p>
                )}
              </div>

              <div>
                <label className="text-black text-sm font-medium mb-2">
                  Placement
                </label>
                <div className="flex items-center border-b">
                  <select
                    name="position"
                    value={formData.position}
                    onChange={fixedPosition ? undefined : handleChange}
                    disabled={fixedPosition}
                    className={`w-full py-2 outline-none text-sm bg-transparent ${
                      fixedPosition ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="text-[#AE4329] text-lg font-bold mb-3">
              Personal Details
            </h3>
            {/* Full Name  */}
            <div>
              <div className="flex flex-col mb-4">
                <label
                  htmlFor="fullname"
                  className="text-black text-sm font-medium mb-2"
                >
                  Full Name
                </label>
                <div className="flex items-center border-b">
                  <input
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-sm "
                  />
                </div>
              </div>
              {errors.fullname && (
                <p className="text-red-500 text-xs">{errors.fullname}</p>
              )}
            </div>
            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col">
                <label
                  htmlFor="dob"
                  className="text-black text-sm font-medium mb-2"
                >
                  Date of Birth
                </label>
                <div className="flex items-center border-b">
                  <input
                    id="dob"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
                {errors.dob && (
                  <p className="text-red-500 text-xs">{errors.dob}</p>
                )}
              </div>
              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="gender"
                    className="text-black text-sm font-medium mb-2"
                  >
                    Gender
                  </label>
                  <div className="flex items-center border-b">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none text-sm"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {errors.gender && (
                  <p className="text-red-500 text-xs">{errors.gender}</p>
                )}
              </div>
            </div>
            {/* Email & Phone No */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="email"
                    className="text-black text-sm font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <div className="flex items-center border-b ">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none  text-sm "
                    />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="mobileNo"
                    className="text-black text-sm font-medium mb-2"
                  >
                    Mobile No.
                  </label>
                  <div className="flex items-center border-b">
                    <input
                      id="mobileNo"
                      name="mobileNo"
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={formData.mobileNo}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none  text-sm "
                    />
                  </div>
                </div>
                {errors.mobileNo && (
                  <p className="text-red-500 text-xs">{errors.mobileNo}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="text-black text-sm font-medium mb-2"
                >
                  Password
                </label>
                <div className="flex items-center border-b">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <div className="mt-4">
              <div className="flex flex-col">
                <label
                  htmlFor="confirmPassword"
                  className="text-black text-sm font-medium mb-2"
                >
                  Confirm Password
                </label>
                <div className="flex items-center border-b">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          {/* Address Details */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="text-[#AE4329] text-lg font-bold mb-3">
              Address Details
            </h3>
            {/* Address */}
            <div>
              <div className="flex flex-col mb-4">
                <label
                  htmlFor="address"
                  className="text-black text-sm font-medium mb-2"
                >
                  Address
                </label>
                <div className="flex items-center border-b">
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-sm "
                  />
                </div>
              </div>

              {errors.address && (
                <p className="text-red-500 text-xs mb-4">{errors.address}</p>
              )}
            </div>
            {/* Pin Code & State */}
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="pinCode"
                    className="text-black text-sm font-medium mb-2"
                  >
                    Pincode
                  </label>
                  <div className="flex items-center border-b ">
                    <input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={formData.pinCode}
                      onChange={handleChange}
                      className=" bg-transparent outline-none  text-sm "
                    />
                  </div>
                </div>
                {errors.pinCode && (
                  <p className="text-red-500 text-xs">{errors.pinCode}</p>
                )}
              </div>
              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="state"
                    className="text-black text-sm font-medium mb-2"
                  >
                    State
                  </label>
                  <div className="flex items-center border-b ">
                    <input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className=" bg-transparent outline-none  text-sm "
                    />
                  </div>
                </div>
                {errors.state && (
                  <p className="text-red-500 text-xs">{errors.state}</p>
                )}
              </div>
            </div>
            {/* City & District */}
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="city"
                    className="text-black text-sm font-medium mb-2"
                  >
                    City
                  </label>
                  <div className="flex items-center border-b ">
                    <input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className=" bg-transparent outline-none  text-sm "
                    />
                  </div>
                </div>
                {errors.city && (
                  <p className="text-red-500 text-xs">{errors.city}</p>
                )}
              </div>
              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="district"
                    className="text-black text-sm font-medium mb-2"
                  >
                    District
                  </label>
                  <div className="flex items-center border-b ">
                    <input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className=" bg-transparent outline-none  text-sm "
                    />
                  </div>
                </div>
                {errors.district && (
                  <p className="text-red-500 text-xs">{errors.district}</p>
                )}
              </div>
            </div>
            {/* checkboxes */}
            <div className="text-xs text-red-600 space-y-2">
              <label className="flex items-center font-semibold">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mr-2"
                />
                I have read & agree to Terms and Conditions*
              </label>
              {errors.agreeTerms && (
                <p className="ml-6 text-red-500 text-xs ">
                  {errors.agreeTerms}
                </p>
              )}

              <label className="flex items-center font-semibold">
                <input
                  type="checkbox"
                  name="ageConfirmed"
                  checked={formData.ageConfirmed}
                  onChange={handleChange}
                  className="mr-2"
                />
                I am atleast 18 years old (21 years in case of domicile being
                Maharashtra) and citizen of India
              </label>
              {errors.ageConfirmed && (
                <p className="ml-6 text-red-500 text-xs ">
                  {errors.ageConfirmed}
                </p>
              )}
            </div>
          </div>

          {/* submit */}
          <div className="text-center">
            {apiError && (
              <p className="text-red-500 text-sm mb-3">{apiError}</p>
            )}

            <button
              type="submit"
              className={`px-14 py-2 rounded text-white mb-4 ${
                formData.agreeTerms && formData.ageConfirmed
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={
                !(formData.agreeTerms && formData.ageConfirmed) || isSubmitting
              }
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/member/signin"
                className="text-blue-600 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
