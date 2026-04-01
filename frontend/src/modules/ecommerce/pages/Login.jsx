import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mobile_no: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!formData.mobile_no.trim()) {
      newErrors.mobile_no = "Mobile Number is required";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/login", formData);

      alert("Login successful ✅");

      localStorage.setItem("isAuth", "true");
      localStorage.setItem("user", JSON.stringify(res.data.data));

      navigate("/home");

    } catch (error) {
      console.log(error.response?.data);
      alert("Invalid Mobile Number or Password ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5e6d3] flex items-center justify-center p-3 sm:p-4 md:p-8">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">

        <div className="text-center py-6">
          <img
            src="/images/ecom/4steplogo.png"
            className="mx-auto h-16 mb-3"
            alt="4step logo"
          />
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Mobile Number"
              value={formData.mobile_no || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile_no: e.target.value
                })
              }
              className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#8b5e3c] text-sm"
            />
            {errors.mobile_no && <p className="text-red-500 text-xs">{errors.mobile_no}</p>}

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#8b5e3c] text-sm"
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg text-sm font-semibold ${loading ? "bg-[#8b5e3c] cursor-not-allowed" : "bg-[#8b5e3c] hover:bg-[#6f472d]"}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-gray-500">
            New here?{" "}
            <Link to="/signup" className="text-[#8b5e3c] font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;