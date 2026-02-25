import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const demoUsers = [
    { mobile: "9876543210", password: "1234321" },
    { mobile: "8866217613", password: "1234321" },
  ];

  const validate = () => {
    let newErrors = {};

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter valid 10 digit mobile number";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const user = demoUsers.find(
      (u) =>
        u.mobile === formData.mobile &&
        u.password === formData.password
    );

    if (user) {
      localStorage.setItem("isAuth", "true");
      navigate("/home");
    } else {
      alert("Invalid mobile number or password ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5e6d3] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">

        <div className="bg-[#8b5e3c] text-white text-center py-4 font-semibold text-2xl">
          User Login
        </div>

        <div className="p-6 space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#8b5e3c]"
            />
            {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile}</p>}

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#8b5e3c]"
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

            <button
              type="submit"
              className="w-full bg-[#8b5e3c] text-white py-3 rounded-lg hover:bg-[#6f472d]"
            >
              LOGIN
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-gray-500">
            New here?{" "}
            <Link to="/signup" className="text-[#8b5e3c] font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;