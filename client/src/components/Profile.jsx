import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

function Profile() {
  const { user, isSignedIn } = useUser();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [skills, setSkills] = useState([]);
  const [inputSkill, setInputSkill] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [credits, setCredits] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [serviceCredits, setServiceCredits] = useState("");
  const [mongoUserId, setMongoUserId] = useState("");
  const [serviceDateTime, setServiceDateTime] = useState(dayjs());

  // Handle profile picture change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setProfilePicFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  // Upload profile picture to Cloudinary
  const uploadProfilePic = async () => {
    if (!profilePicFile) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", profilePicFile);
      formData.append("clerkId", user.id);
      const response = await axios.post(
        "http://localhost:5000/api/users/upload-profile-pic",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      toast.success('Profile picture uploaded successfully!');
      return response.data.profilePic;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error('Failed to upload profile picture');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      let finalProfilePic = profilePic;
      if (profilePicFile) {
        const uploadedUrl = await uploadProfilePic();
        if (uploadedUrl) {
          finalProfilePic = uploadedUrl;
        }
      }
      await axios.post(
        "http://localhost:5000/api/users/setup-complete",
        { clerkId: user.id, name, skills, profilePic: finalProfilePic },
        { withCredentials: true }
      );
      setIsSetupDone(true);
      setEditMode(false);
      setProfilePicFile(null);
      setProfilePic(finalProfilePic);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error("Failed to save profile", err);
      toast.error('Failed to save profile');
    }
  };

  // Add service handler
  const handleAddService = async () => {
    if (serviceName.trim() && serviceCredits) {
      const newService = {
        name: serviceName.trim(),
        credits: parseInt(serviceCredits),
        time: serviceDateTime
      };
      setServices((prev) => [...prev, newService]);
      setServiceName("");
      setServiceCredits("");
      setServiceDateTime(dayjs());
      try {
        await axios.post(
          "http://localhost:5000/api/sessions/offer",
          {
            teacher: mongoUserId,
            skill: newService.name,
            creditsUsed: newService.credits,
            dateTime: serviceDateTime.toISOString(),
          },
          { withCredentials: true }
        );
        toast.success('Service added successfully!');
      } catch (error) {
        console.error("Failed to add service:", error.response?.data || error.message);
        toast.error('Failed to add service');
      }
    }
  };

  // Delete service function
  const handleDeleteService = async (sessionId) => {
    console.log("Trying to delete sessionId:", sessionId);

  try {
    await axios.delete(`http://localhost:5000/api/sessions/delete/${sessionId}`, {
      withCredentials: true,
    });

    // Remove the deleted session from UI
    setServices((prev) => prev.filter((service) => service._id !== sessionId));
    toast.success("Service deleted successfully!");
  } catch (error) {
    console.error("Failed to delete service:", error);
    toast.error("Failed to delete service");
  }
};


  // Sync user effect
  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn) return;
      try {
        const res = await axios.post(
          "http://localhost:5000/api/users/sync",
          {
            clerkId: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
          },
          { withCredentials: true }
        );
        const data = res.data;
        setCredits(data.totalCredits);
        setIsSetupDone(data.isSetupDone);
        setName(data.name);
        setSkills(data.skills);
        setProfilePic(data.profilePic);
        setMongoUserId(data._id);
        if (data._id) fetchOfferedServices(data._id);
        if (data.showCongrats) setShowCongrats(true);
      } catch (err) {
        console.error("Sync failed", err);
      }
    };

    const fetchOfferedServices = async (userId) => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sessions/offered/${userId}`);
        const sessions = res.data;
        const formatted = sessions.map((s) => ({
          _id: s._id,
          name: s.skill,
          credits: s.creditsUsed,
          time: s.dateTime
        }));
        setServices(formatted);
        console.log("Fetched offered services:", formatted);
      } catch (err) {
        console.error("Could not fetch offered services", err);
      }
    };

    syncUser();
  }, [isSignedIn, user]);

  // Add skill handler
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (inputSkill.trim() && !skills.includes(inputSkill.trim())) {
      setSkills([...skills, inputSkill.trim()]);
      setInputSkill("");
    }
  };

  // Remove skill handler
  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  if (!isSignedIn) return <div>Loading...</div>;

  if (showCongrats) {
    return (
      <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-3">🎉 Congratulations!</h2>
        <p className="text-gray-700 mb-5">
          You've earned <span className="font-semibold text-blue-600">{credits} credits</span>{" "}
          for joining us!
        </p>
        <button
          onClick={() => setShowCongrats(false)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  if (!isSetupDone) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-center mb-6 text-blue-800">
                Set up your profile
              </h2>
              <div className="flex flex-col items-center gap-4">
                <label className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg cursor-pointer">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-center flex items-center justify-center w-full h-full text-gray-400">
                      Upload Photo
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleProfilePicChange}
                  />
                </label>
                {uploading && (
                  <p className="text-blue-600 text-sm">Uploading...</p>
                )}
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border rounded-lg px-4 py-2 text-gray-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-center mb-4 text-blue-800">
                Add your top skills
              </h2>
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inputSkill}
                  onChange={(e) => setInputSkill(e.target.value)}
                  placeholder="e.g. React"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </form>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className={`w-full py-2 rounded-lg text-white ${
                  uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {uploading ? 'Saving...' : 'Submit & View Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main profile view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <br />
      <br />
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="col-span-2 bg-white shadow-xl rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-md cursor-pointer">
              <img
                src={profilePic || user.imageUrl || '/user.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {editMode && (
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleProfilePicChange}
                />
              )}
            </label>
            <div>
              {editMode ? (
                <input
                  className="text-xl font-semibold text-blue-700 border-b border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <h2 className="text-2xl font-semibold text-blue-700">{name}</h2>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.length > 0 ? (
                  skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full flex items-center gap-1"
                    >
                      {skill}
                      {editMode && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No skills added.
                  </p>
                )}
              </div>
              {editMode && (
                <form onSubmit={handleAddSkill} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={inputSkill}
                    onChange={(e) => setInputSkill(e.target.value)}
                    placeholder="Add Skill"
                    className="px-2 py-1 border rounded-md"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-blue-700">Credits</p>
            <p className="text-3xl font-bold text-green-600">{credits}</p>
            <div className="mt-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-blue-600 underline"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className={`px-4 py-1 rounded mt-2 text-white ${
                    uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white shadow-xl rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2">
            📅 Calendar (Upcoming Sessions)
          </h3>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar />
          </LocalizationProvider>
        </div>

        {/* Meeting UI */}
        <div className="bg-white shadow-xl rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2">
            📹 My Session
          </h3>
          {/* Services List */}
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-gray-400 italic">No session listed yet.</p>
            ) : (
              services.map((service, idx) => (
                <div
                  key={idx}
                  className="border border-gray-300 rounded-xl p-4 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-blue-800">{service.name}</p>
                    <p className="text-sm text-green-600">
                      Credits Required: <span className="font-semibold">{service.credits}</span>
                    </p>
                    {service.time && (
                      <p className="text-sm text-gray-600">
                        Time: {dayjs(service.time).format("DD MMM YYYY, hh:mm A")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Service Inputs */}
          <div className="mt-6 space-y-2">
            <input
              type="text"
              placeholder="Service name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
            />
            <input
              type="number"
              placeholder="Credit required"
              value={serviceCredits}
              onChange={(e) => setServiceCredits(e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Select date and time"
                value={serviceDateTime}
                onChange={(newValue) => setServiceDateTime(newValue)}
                className="w-full"
              />
            </LocalizationProvider>
            <button
              onClick={handleAddService}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
            >
              Add Service
            </button>
          </div>
        </div>
      </div>...
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Profile;
