import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoPersonFill } from "react-icons/go";
import { FaCalendar } from "react-icons/fa";
import { FaLocationPin } from "react-icons/fa6";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { MdHome } from "react-icons/md";
import { TbPasswordUser } from "react-icons/tb";
import api from "../api/axios";

function Signup() {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        pinCode: "",
        state: "",
        city: "",
        mobileNo: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
        hasUplineId: false,
        agreeTerms: false,
        ageConfirmed: false,
    });

    const [errors, setErrors] = useState({});


    const validateForm = () => {
        const newErrors = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First Name is required";
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = "First Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
            newErrors.firstName = "First Name can only contain letters";
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last Name is required";
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = "Last Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
            newErrors.lastName = "Last Name can only contain letters";
        }

        // Date of Birth validation
        if (!formData.dob) {
            newErrors.dob = "Date of Birth is required";
        } else {
            const today = new Date();
            const birthDate = new Date(formData.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                newErrors.dob = "You must be at least 18 years old";
            }
        }
        // Password validation
        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        // Confirm Password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm Password is required";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Gender validation
        if (!formData.gender.trim()) {
            newErrors.gender = "Gender is required";
        }

        // Pin Code validation
        if (!formData.pinCode.trim()) {
            newErrors.pinCode = "Pin Code is required";
        } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
            newErrors.pinCode = "Pin Code must be 6 digits";
        }

        // State validation
        if (!formData.state.trim()) {
            newErrors.state = "State is required";
        } else if (formData.state.length < 2) {
            newErrors.state = "State must be at least 2 characters";
        }

        // City validation
        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        } else if (formData.city.length < 2) {
            newErrors.city = "City must be at least 2 characters";
        }

        // Mobile No validation
        if (!formData.mobileNo.trim()) {
            newErrors.mobileNo = "Mobile Number is required";
        } else if (!/^[6-9]\d{9}$/.test(formData.mobileNo.trim())) {
            newErrors.mobileNo = "Mobile Number must be a valid 10-digit number";
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address";
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        } else if (formData.address.length < 5) {
            newErrors.address = "Address must be at least 5 characters";
        }

        // Terms & Conditions checkbox
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = "You must agree to the Terms and Conditions";
        }

        // Age confirmation checkbox
        if (!formData.ageConfirmed) {
            newErrors.ageConfirmed = "You must confirm your age";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                setLoading(true);
                const dataToSend = {
                    ...formData,
                    password_confirmation: formData.confirmPassword
                };

                const response = await api.post("/signup", dataToSend);

                const generatedMemberId = response.data.data.member_id;


                alert(`Sign up successful!\nMember ID: ${generatedMemberId}`);
                navigate("/");

            } catch (error) {
                console.log(error.response?.data);

                if (error.response?.data?.errors) {
                    alert("Validation error");
                } else {
                    alert("Server error");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className='min-h-screen bg-[#f5e6d3] flex items-center justify-center p-3 sm:p-4 md:p-8'>
            <div className="bg-gray-200 w-full max-w-lg rounded-xl shadow-xl overflow-hidden p-3 sm:p-4">
                <div className="p-2 overflow-hidden rounded-xl text-center mb-4 bg-[#8b5e3c]">
                    <h1 className='text-2xl sm:text-3xl font-semibold text-white'>Sign up</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Personal Details */}
                    <div className="bg-white p-3 sm:p-4 overflow-hidden rounded-xl text-center mb-4">
                        <h2 className='text-xs font-semibold text-gray-500 text-start'>
                            Personal Details as per KYC Documents*
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3 mt-2">
                            <div>
                                <div className="flex items-center border-b ">
                                    <GoPersonFill className="text-gray-400 mr-3 flex-shrink-0" />
                                    <select
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 focus:outline-none text-xs"
                                    >
                                        <option value="">Select Title</option>
                                        <option value="Mr.">Mr.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="M/s.">M/s.</option>
                                        <option value="Mrs.">Mrs.</option>
                                    </select>
                                </div>
                                {errors.title && <p className="text-red-500 text-xs mt-1 text-start">{errors.title}</p>}
                            </div>
                            <div>
                                <div className="flex items-center border-b">
                                    <GoPersonFill className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 text-xs"
                                    />
                                </div>
                                {errors.firstName && <p className="text-red-500 text-xs mt-1 text-start">{errors.firstName}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3">
                            <div>
                                <div className="flex items-center border-b">
                                    <GoPersonFill className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 text-xs"
                                    />
                                </div>
                                {errors.lastName && <p className="text-red-500 text-xs mt-1 text-start">{errors.lastName}</p>}
                            </div>
                            <div>
                                <div className="flex items-center border-b">
                                    <FaCalendar className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 text-xs"
                                    />
                                </div>
                                {errors.dob && <p className="text-red-500 text-xs mt-1 text-start">{errors.dob}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3">
                            <div>
                                <div className="flex items-center border-b">
                                    <TbPasswordUser className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full outline-none py-2 text-xs ${errors.password ? "text-red-500" : "text-gray-700"
                                        }`}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 text-start">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center border-b">
                                    <TbPasswordUser className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full outline-none py-2 text-xs ${errors.confirmPassword ? "text-red-500" : "text-gray-700"
                                            }`}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1 text-start">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center border-b">
                                <GoPersonFill className="text-gray-400 mr-3 flex-shrink-0" />
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full outline-none py-2 text-xs"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            {errors.gender && <p className="text-red-500 text-xs mt-1 text-start">{errors.gender}</p>}
                        </div>
                    </div>
                    {/* Address Details */}
                    <div className="bg-white p-3 sm:p-4 overflow-hidden rounded-xl text-center mb-4">
                        <h2 className='text-xs font-semibold text-gray-500 text-start'>
                            Permenant Address Details as per KYC Documents*
                        </h2>
                        <div className="flex items-center border-b mb-2">
                            <FaLocationPin className="text-gray-400 mr-3 text-xs flex-shrink-0" />
                            <p className="py-2 text-sm">India</p>
                        </div>
                        <div>
                            <div className="flex items-center border-b">
                                <FaLocationPin className="text-gray-400 mr-3 text-xs flex-shrink-0" />
                                <input
                                    type="text"
                                    name="pinCode"
                                    placeholder="Pin Code"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                    className="w-full outline-none py-2 text-xs"
                                />
                            </div>
                            {errors.pinCode && <p className="text-red-500 text-xs mt-1 text-start">{errors.pinCode}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3 mt-2">
                            <div>
                                <div className="flex items-center border-b ">
                                    <FaLocationPin className="text-gray-400 mr-3 text-xs flex-shrink-0" />
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 text-xs"
                                    />
                                </div>
                                {errors.state && <p className="text-red-500 text-xs mt-1 text-start">{errors.state}</p>}
                            </div>
                            <div>
                                <div className="flex items-center border-b">
                                    <GoPersonFill className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 text-xs"
                                    />
                                </div>
                                {errors.city && <p className="text-red-500 text-xs mt-1 text-start">{errors.city}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-3 mt-2">
                            <div>
                                <div className="flex items-center border-b ">
                                    <BsFillTelephoneFill className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        name="mobileNo"
                                        placeholder="Mobile No"
                                        value={formData.mobileNo}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 text-xs"
                                    />
                                </div>
                                {errors.mobileNo && <p className="text-red-500 text-xs mt-1 text-start">{errors.mobileNo}</p>}
                            </div>
                            <div>
                                <div className="flex items-center border-b">
                                    <MdEmail className="text-gray-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full outline-none py-2 text-xs"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1 text-start">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center border-b">
                                <MdHome className="text-gray-400 mr-3 flex-shrink-0" />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address(House Number,Street Name,Locality)"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full outline-none py-2 text-xs"
                                />
                            </div>
                            {errors.address && <p className="text-red-500 text-xs mt-1 text-start">{errors.address}</p>}
                        </div>
                    </div>
                    {/* Terms & Conditions */}
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-3">
                        <div>
                            <label className={`text-xs sm:text-sm inline-flex font-semibold ${errors.agreeTerms ? "text-red-600" : "text-red-600"
                                }`}>
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className="mr-3 flex-shrink-0"
                                />
                                <span>I have read & agree to the <span className="underline underline-offset-2 ml-1">Terms and Conditions*</span></span>
                            </label>
                            {errors.agreeTerms && <p className="text-red-500 text-xs mt-1 text-start">{errors.agreeTerms}</p>}
                        </div>

                        <div>
                            <label className={`text-xs sm:text-sm flex items-start font-semibold ${errors.ageConfirmed ? "text-red-600" : "text-red-600"
                                }`}>
                                <input
                                    type="checkbox"
                                    name="ageConfirmed"
                                    checked={formData.ageConfirmed}
                                    onChange={handleChange}
                                    className="mr-3 mt-1 flex-shrink-0"
                                />
                                <span>I am atleast 18 years old (21 years in case of domicile being Maharashtra) and citizen of India</span>
                            </label>
                            {errors.ageConfirmed && <p className="text-red-500 text-xs mt-1 text-start">{errors.ageConfirmed}</p>}
                        </div>
                    </div>
                    {/* Button */}
                    <div className="text-center mb-4 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`text-white px-12 sm:px-15 py-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto ${loading ? "bg-[#8b5e3c] cursor-not-allowed" : "bg-[#8b5e3c] hover:bg-[#6f472d]"}`}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>

                        <div className="mt-4 text-xs sm:text-sm">
                            Already Have an Account?
                            <Link to="/" className="text-blue-700 ml-2 cursor-pointer">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </form>

            </div >
        </div >
    );
}

export default Signup;