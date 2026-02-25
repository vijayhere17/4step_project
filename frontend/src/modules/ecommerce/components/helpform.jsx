import React, { useState, useRef, useEffect } from 'react'
import { LiaInfoCircleSolid } from "react-icons/lia";

function Helpform() {

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    mobile: '',
    email: '',
    category: '',
    subject: '',
    details: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let errors = {};

    if (!formData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    if (!formData.category || formData.category === "Select Category") {
      errors.category = "Please select a category";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.details.trim()) {
      errors.details = "Details are required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    alert("We have received your query. We will contact you soon.");

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-5xl mx-auto">

        <p className="text-sm text-gray-500 mb-4">
          Home &gt; Help &gt; New Ticket
        </p>

        <h1 className="text-2xl font-semibold mb-2">How can we help?</h1>
        <p className="text-sm text-gray-700 font-semibold mb-8">
          Need assistance with your order or interested in joining Team Tira?
          Submit a ticket here. Have you looked at our{" "}
          <span className="text-red-500 cursor-pointer">FAQs</span>?
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                maxLength="10"
                placeholder='+91 9913198655'
                pattern="[0-9]{10}"
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {formErrors.mobile && <p className="text-red-500 text-xs">{formErrors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder='example@gmail.com'
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Category<span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option>Select Category</option>
              <option>Order Issue</option>
              <option>Account Issue</option>
              <option>General Query</option>
            </select>
            {formErrors.category && <p className="text-red-500 text-xs">{formErrors.category}</p>}
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Subject<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
            {formErrors.subject && <p className="text-red-500 text-xs">{formErrors.subject}</p>}
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Share details here<span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              name="details"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 resize-none"
            />
            {formErrors.details && <p className="text-red-500 text-xs">{formErrors.details}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Image (Optional)
            </label>

            <div
              onClick={handleFileClick}
              className="border rounded-md px-4 py-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">PNG, JPG, JPEG (Max 2MB)</span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/png,image/jpeg,image/jpg"
              />
            </div>

            {error && (
              <div className="mt-2 bg-red-100 text-red-700 text-xs px-3 py-2 rounded text-center">
                {error}
              </div>
            )}

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-4 max-h-48 object-contain border rounded"
              />
            )}

            <div className="mt-2 bg-yellow-100 text-xs px-3 py-2 rounded text-center">
              <LiaInfoCircleSolid className="inline text-lg text-red-600 mr-2" />
              Upload clear images of Product & Packaging Box in PNG, JPG, JPEG format only
            </div>
          </div>

          <button
            type="submit"
            className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Submit
          </button>

        </form>
      </div>
    </div>
  );
}

export default Helpform;
