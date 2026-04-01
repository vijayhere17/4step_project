import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaEdit, FaTimes, FaCheckCircle, FaExclamationCircle, FaIdCard, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';

// Create axios instance with base URL
const api = axios.create({
  baseURL:  'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    mobile_no: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    dob: '',
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load user data on mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        fullname: storedUser.fullname || '',
        email: storedUser.email || '',
        mobile_no: storedUser.mobile_no || '',
        address: storedUser.address || '',
        city: storedUser.city || '',
        state: storedUser.state || '',
        pin_code: storedUser.pin_code || '',
        dob: storedUser.dob || '',
        gender: storedUser.gender || ''
      });
    }
  }, []);

  // Validation logic
  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.mobile_no.trim()) {
      newErrors.mobile_no = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = 'Mobile number must be 10 digits';
    }
    
    if (formData.pin_code && !/^\d{6}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'PIN code must be 6 digits';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission with axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Split fullname into firstName and lastName
      const nameParts = formData.fullname.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const response = await api.put(`/api/members/${user.id}`, {
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        mobileNo: formData.mobile_no,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pin_code,
        dob: formData.dob,
        gender: formData.gender
      });

      const data = response.data;

      // Update localStorage with new user data
      const updatedUser = { ...user, ...data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Auto-hide success message after 3s
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {
      console.error('Update error:', error);
      
      // Handle Laravel validation errors
      if (error.response && error.response.data.errors) {
        const validationErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          validationErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(validationErrors);
        setMessage({ 
          type: 'error', 
          text: 'Please fix the validation errors' 
        });
      } else if (error.response && error.response.data.message) {
        setMessage({ 
          type: 'error', 
          text: error.response.data.message 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to update profile. Please try again.' 
        });
      }
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing & reset form
  const handleCancel = () => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        mobile_no: user.mobile_no || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pin_code: user.pin_code || '',
        dob: user.dob || '',
        gender: user.gender || ''
      });
    }
    setErrors({});
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-3xl text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your profile</p>
          <a href="/" className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg flex-shrink-0">
              {getInitials(user.fullname)}
            </div>
            <div className="text-center sm:text-left flex-1 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 wrap-break-word">{user.fullname}</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 break-all">{user.email}</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                  {user.member_id}
                </span>
                {user.gender && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {user.gender}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 animate-slideDown text-sm sm:text-base ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {message.type === 'success' ? <FaCheckCircle className="text-base sm:text-lg" /> : <FaExclamationCircle className="text-base sm:text-lg" />}
            </div>
            <span className="font-medium flex-1">{message.text}</span>
          </div>
        )}

        {/* Profile Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Personal Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors bg-blue-50 sm:bg-transparent px-4 py-2 sm:p-0 rounded-lg sm:rounded-none"
              >
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Member ID */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <FaIdCard className="inline mr-2 text-gray-400 text-sm" /> Member ID
                </label>
                <input
                  type="text"
                  value={user.member_id}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Full Name */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-gray-400 text-sm" /> Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.fullname ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.fullname && <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-gray-400 text-sm" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-gray-400 text-sm" /> Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength="10"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.mobile_no ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                  placeholder="10 digit mobile number"
                />
                {errors.mobile_no && <p className="mt-1 text-xs text-red-500">{errors.mobile_no}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <FaBirthdayCake className="inline mr-2 text-gray-400 text-sm" /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.dob ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <FaVenusMars className="inline mr-2 text-gray-400 text-sm" /> Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-gray-400 text-sm" /> Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all resize-none`}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.state ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
              </div>

              {/* PIN Code */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                <input
                  type="text"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength="6"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${
                    errors.pin_code ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } ${isEditing ? 'bg-white' : 'bg-gray-50'} focus:outline-none focus:ring-2 transition-all`}
                  placeholder="6 digit PIN code"
                />
                {errors.pin_code && <p className="mt-1 text-xs text-red-500">{errors.pin_code}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-3 justify-end pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default ProfilePage;