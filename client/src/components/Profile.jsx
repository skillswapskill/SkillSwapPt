import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { set } from "mongoose";
import { ToastContainer, toast } from 'react-toastify';


function Profile() {
  const { user, isSignedIn } = useUser();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [skills, setSkills] = useState([]);
  const [inputSkill, setInputSkill] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [credits, setCredits] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [serviceCredits, setServiceCredits] = useState("");

  const [mongoUserId, setMongoUserId] = useState("");

  // in syncUser()

  const handleAddService = async () => {
    if (serviceName.trim() && serviceCredits) {
      // 1. Update frontend state
      const newService = {
        name: serviceName.trim(),
        credits: parseInt(serviceCredits),
      };
      setServices((prev) => [...prev, newService]);
      setServiceName("");
      setServiceCredits("");

      try {
        // 2. Send service to backend
        await axios.post(
          "http://localhost:5000/api/sessions/offer",
          {
            teacher: mongoUserId, // ✅ matches backend
            skill: newService.name, // ✅ skill instead of serviceName
            creditsUsed: newService.credits, // ✅ matches backend
          },
          {
            withCredentials: true, // optional if using cookies/sessions
          }
        );

        console.log("✅ Service added to backend");
        const notify = () => toast('Wow so easy !');
      } catch (error) {
        console.error(
          "❌ Failed to add service:",
          error.response?.data || error.message
        );
        alert("Failed to add service. Please try again.");
      }
    }
  };

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
        setMongoUserId(res.data._id); // return it from backend


        if (data._id) fetchOfferedServices(data._id); // ✅ fetch services after syncing user

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
        name: s.skill,
        credits: s.creditsUsed,
      }));
      setServices(formatted);
    } catch (err) {
      console.error("❌ Could not fetch offered services", err);
    }
  };

    syncUser();
  }, [isSignedIn]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (inputSkill.trim() && !skills.includes(inputSkill.trim())) {
      setSkills([...skills, inputSkill.trim()]);
      setInputSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file)); // Optional: later you can upload this to cloud
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/users/setup-complete",
        {
          clerkId: user.id,
          name,
          skills,
          profilePic,
        },
        { withCredentials: true }
      );

      setIsSetupDone(true);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  if (!isSignedIn) return <div>Loading...</div>;

  if (showCongrats) {
    return (
      <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-3">
          🎉 Congratulations!
        </h2>
        <p className="text-gray-700 mb-5">
          You've earned{" "}
          <span className="font-semibold text-blue-600">{credits} credits</span>{" "}
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

  // Show Setup Form if not yet setup
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
                      Upload
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleProfilePicChange}
                  />
                </label>
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
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Submit & View Profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Profile View + Edit
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <br></br>
      <br></br>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="col-span-2 bg-white shadow-xl rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-md cursor-pointer">
              <img
                src={profilePic || user.imageUrl}
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
                  className="text-blue-600 underline "
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 mt-2"
                >
                  Save Changes
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
                  className="border border-gray-300 rounded-xl p-4 shadow-sm"
                >
                  <p className="font-medium text-blue-800">{service.name}</p>
                  <p className="text-sm text-green-600">
                    Credits Required:{" "}
                    <span className="font-semibold">{service.credits}</span>
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Service Inputs */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Service name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="border rounded-md px-3 py-2 w-full mb-2"
            />
            <input
              type="number"
              placeholder="Credit required"
              value={serviceCredits}
              onChange={(e) => setServiceCredits(e.target.value)}
              className="border rounded-md px-3 py-2 w-full mb-2"
            />
            <button
              onClick={handleAddService}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
            >
              Add Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
