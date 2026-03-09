import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const toAddressState = (member) => ({
  address: member?.address || "",
  state: member?.state || "",
  city: member?.city || "",
  district: member?.district || "",
  pincode: member?.pin_code || "",
});

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function MyProfileView() {
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [address, setAddress] = useState(toAddressState(null));
  const [tempAddress, setTempAddress] = useState(address);

  useEffect(() => {
    const loadProfile = async () => {
      setApiError("");
      setIsLoading(true);

      let storedMember = {};
      try {
        storedMember = JSON.parse(localStorage.getItem("memberData") || "{}") || {};
      } catch {
        storedMember = {};
      }

      if (!storedMember?.user_id) {
        setMember(storedMember || null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/member/profile?user_id=${encodeURIComponent(storedMember.user_id)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setApiError(data?.message || "Unable to load profile");
          setMember(storedMember);
          return;
        }

        setMember(data.member || storedMember);
        localStorage.setItem("memberData", JSON.stringify(data.member || storedMember));
      } catch {
        setApiError("Unable to load profile from server");
        setMember(storedMember);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const nextAddress = toAddressState(member);
    setAddress(nextAddress);
    setTempAddress(nextAddress);
  }, [member]);

  const profile = useMemo(() => {
    const fullName = (member?.fullname || "").trim();
    const nameParts = fullName ? fullName.split(/\s+/) : [];
    const firstName = nameParts[0] || "-";
    const lastName = nameParts.slice(1).join(" ") || "-";
    const location = [member?.state, member?.city].filter(Boolean).join(", ") || "-";

    return {
      fullName: fullName || "Member",
      location,
      firstName,
      lastName,
      dob: formatDate(member?.dob),
      email: member?.email || "-",
      phone: member?.mobile_no || "-",
      gender: member?.gender || "-",
    };
  }, [member]);

  const handleEdit = () => {
    setTempAddress(address);
    setEditMode(true);
  };

  const handleChange = (e) => {
    setTempAddress({
      ...tempAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    if (!member?.user_id) {
      setApiError("User session not found. Please sign in again.");
      return;
    }

    const saveProfile = async () => {
      setApiError("");
      setSaveMessage("");
      setIsSaving(true);

      try {
        const response = await fetch(`${API_BASE_URL}/member/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: member.user_id,
            address: tempAddress.address,
            state: tempAddress.state,
            city: tempAddress.city,
            district: tempAddress.district,
            pin_code: tempAddress.pincode,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setApiError(data?.message || "Unable to save profile");
          return;
        }

        const updatedMember = data.member || member;
        setMember(updatedMember);
        localStorage.setItem("memberData", JSON.stringify(updatedMember));
        setAddress(toAddressState(updatedMember));
        setTempAddress(toAddressState(updatedMember));
        setEditMode(false);
        setSaveMessage("Profile updated successfully");
      } catch {
        setApiError("Unable to save profile to server");
      } finally {
        setIsSaving(false);
      }
    };

    saveProfile();
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">

        <Navbar />

        <div className="text-center mt-6">
          <h1 className="text-2xl font-bold text-[#B0422E]">
            My Profile
          </h1>
          {isLoading && <p className="text-sm text-gray-500 mt-2">Loading profile...</p>}
          {isSaving && <p className="text-sm text-gray-500 mt-2">Saving profile...</p>}
          {saveMessage && <p className="text-sm text-green-600 mt-2">{saveMessage}</p>}
          {apiError && <p className="text-sm text-red-500 mt-2">{apiError}</p>}
        </div>

        <div className="p-6 space-y-6">

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-blue-700 text-lg font-bold">
              {profile.fullName}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {profile.location}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-blue-700 text-lg font-bold mb-6">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-6 gap-x-6">
              <Info label="First Name" value={profile.firstName} />
              <Info label="Last Name" value={profile.lastName} />
              <Info label="Date of Birth" value={profile.dob} />
              <Info label="Email Address" value={profile.email} />
              <Info label="Phone Number" value={profile.phone} />
              <Info label="Gender" value={profile.gender} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-blue-700 text-lg font-bold">
                Shipping Address
              </h2>

              {!editMode ? (
                <button
                  onClick={handleEdit}
                  className="bg-[#B0422E] hover:bg-[#B0422E] text-white px-5 py-2 rounded-md text-sm"
                >
                  ✎ Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-y-6 gap-x-6">

              <Field
                label="Address"
                name="address"
                value={tempAddress.address}
                editMode={editMode}
                onChange={handleChange}
                colSpan="col-span-2"
              />

              <Field
                label="State"
                name="state"
                value={tempAddress.state}
                editMode={editMode}
                onChange={handleChange}
              />

              <Field
                label="City"
                name="city"
                value={tempAddress.city}
                editMode={editMode}
                onChange={handleChange}
              />

              <Field
                label="District"
                name="district"
                value={tempAddress.district}
                editMode={editMode}
                onChange={handleChange}
              />

              <Field
                label="Pincode"
                name="pincode"
                value={tempAddress.pincode}
                editMode={editMode}
                onChange={handleChange}
              />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Field({ label, name, value, editMode, onChange, colSpan }) {
  return (
    <div className={colSpan}>
      <p className="text-gray-500 text-sm">{label}</p>

      {editMode ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border rounded px-3 py-1 mt-1"
        />
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </div>
  );
}