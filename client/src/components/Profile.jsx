import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";

// ✅ Import the dynamic API client
import { apiClient } from "../config/api";

// 🎨 Loading Progress Bar Component
const LoadingProgressBar = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // Simulate realistic loading with varying speeds
          const increment = Math.random() * 15 + 5; // Random between 5-20
          return Math.min(prev + increment, 100);
        });
      }, 200); // Update every 200ms

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main progress bar */}
      <div className="h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-lg transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.6)',
          }}
        />
      </div>
      
      {/* Shimmer effect */}
      <div
        className="absolute top-0 h-1 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
        style={{
          left: `${Math.max(0, progress - 10)}%`,
          transition: 'left 300ms ease-out',
        }}
      />
    </div>
  );
};

function Profile() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  // 🎨 Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);

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
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setProfilePicFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  // ✅ Upload profile picture using dynamic API
  const uploadProfilePic = async () => {
    if (!profilePicFile) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePic", profilePicFile);
      formData.append("clerkId", user.id);

      // ✅ Using apiClient instead of hardcoded URL
      const response = await apiClient.post(
        "/api/users/upload-profile-pic",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Profile picture uploaded successfully!");
      return response.data.profilePic;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload profile picture");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle form submission using dynamic API
  const handleSubmit = async () => {
    try {
      let finalProfilePic = profilePic;
      if (profilePicFile) {
        const uploadedUrl = await uploadProfilePic();
        if (uploadedUrl) {
          finalProfilePic = uploadedUrl;
        }
      }

      // ✅ Using apiClient instead of hardcoded URL
      await apiClient.post("/api/users/setup-complete", {
        clerkId: user.id,
        name,
        skills,
        profilePic: finalProfilePic,
      });

      setIsSetupDone(true);
      setEditMode(false);
      setProfilePicFile(null);
      setProfilePic(finalProfilePic);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile", err);
      toast.error("Failed to save profile");
    }
  };

  // ✅ Add service using dynamic API
  const handleAddService = async () => {
    if (skills.some(skill => skill.toLowerCase().trim() === serviceName.toLowerCase().trim())) {
      if (serviceName.trim() && serviceCredits) {
        const newService = {
          name: serviceName.trim(),
          credits: parseInt(serviceCredits),
          time: serviceDateTime,
        };
        setServices((prev) => [...prev, newService]);
        setServiceName("");
        setServiceCredits("");
        setServiceDateTime(dayjs());

        try {
          // ✅ Using apiClient instead of hardcoded URL
          await apiClient.post("/api/sessions/offer", {
            teacher: mongoUserId,
            skill: newService.name,
            creditsUsed: newService.credits,
            dateTime: serviceDateTime.toISOString(),
          });
          toast.success("Service added successfully!");
        } catch (error) {
          console.error(
            "Failed to add service:",
            error.response?.data || error.message
          );
          toast.error("Failed to add service");
        }
      }
    } else {
      toast.error("Service name must match one of your skills");
      setServiceName(""); // Clear input if skill doesn't match
      setServiceCredits(""); // Clear credits input as well
      setServiceDateTime(dayjs()); // Reset date/time to current
    }
  };

  // ✅ Delete service using dynamic API
  const handleDeleteService = async (sessionId) => {
    try {
      // ✅ Using apiClient instead of hardcoded URL
      await apiClient.delete(`/api/sessions/delete/${sessionId}`);

      // Remove the deleted session from UI
      setServices((prev) =>
        prev.filter((service) => service._id !== sessionId)
      );
      toast.success("Service deleted successfully!");
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Failed to delete service");
    }
  };

  // Handle redeem navigation
  const handleRedeemCredits = () => {
    navigate("/redeem");
  };

  // 🔥 NEW: Handle buy credits navigation
  const handleBuyCredits = () => {
    navigate("/payment");
  };

  // 🎨 Custom Day Component for Calendar with Session Highlighting (NO BADGE)
  const CustomDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    
    // Check if this date has any sessions
    const hasSession = services.some(service => 
      dayjs(service.time).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
    );

    if (hasSession && !outsideCurrentMonth) {
      return (
        <PickersDay 
          {...other} 
          day={day} 
          outsideCurrentMonth={outsideCurrentMonth}
          sx={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#bbf7d0',
            },
            '&.Mui-selected': {
              backgroundColor: '#10b981',
              color: 'white',
            }
          }}
        />
      );
    }

    return <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />;
  };

  // ✅ Sync user using dynamic API with loading simulation
  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn) return;
      
      try {
        // Start loading
        setIsInitialLoading(true);
        
        // ✅ Using apiClient instead of hardcoded URL
        const res = await apiClient.post("/api/users/sync", {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
        });

        const data = res.data;
        setCredits(data.totalCredits);
        setIsSetupDone(data.isSetupDone);
        setName(data.name);
        setSkills(data.skills);
        setProfilePic(data.profilePic);
        setMongoUserId(data._id);
        
        if (data._id) await fetchOfferedServices(data._id);
        if (data.showCongrats) setShowCongrats(true);

        // Simulate realistic loading time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (err) {
        console.error("Sync failed", err);
        // Still stop loading even on error
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        // Ensure loading completes
        setTimeout(() => {
          setIsInitialLoading(false);
          setTimeout(() => setIsPageReady(true), 100);
        }, 500);
      }
    };

    // ✅ Fetch offered services using dynamic API
    const fetchOfferedServices = async (userId) => {
      try {
        // ✅ Using apiClient instead of hardcoded URL
        const res = await apiClient.get(`/api/sessions/offered/${userId}`);
        const sessions = res.data;
        const formatted = sessions.map((s) => ({
          _id: s._id,
          name: s.skill,
          credits: s.creditsUsed,
          time: s.dateTime,
        }));
        setServices(formatted);
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

  // Show loading screen
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading progress bar and initial loading screen
  if (isInitialLoading || !isPageReady) {
    return (
      <>
        <LoadingProgressBar isLoading={isInitialLoading} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2 animate-pulse">SkillSwap</h2>
            <p className="text-gray-600 animate-pulse">Loading your profile...</p>
            <div className="mt-6 flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 🎨 SIMPLIFIED Congratulations Screen - Clean & Minimal
  if (showCongrats) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 text-center transform animate-scale-in">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="text-4xl">🎉</span>
          </div>

          {/* Welcome Message */}
          <h2 className="text-3xl font-bold text-blue-800 mb-4">
            Welcome to SkillSwap!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Congratulations! Your account has been created successfully.
          </p>

          {/* Credits Display */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <p className="text-blue-700 font-medium mb-2">Welcome Bonus</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-green-600">
                {credits}
              </span>
              <span className="text-lg font-semibold text-blue-700">Credits</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Start learning or teaching skills with your bonus credits!
            </p>
          </div>

          {/* Quick Tips */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Quick Start:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Browse skills and book sessions to learn</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Offer your skills to earn more credits</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span>Redeem credits when you reach 1,000</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => setShowCongrats(false)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (!isSetupDone) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6 transform animate-fade-in-up">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-center mb-6 text-blue-800">
                Set up your profile
              </h2>
              <div className="flex flex-col items-center gap-4">
                <label className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg cursor-pointer hover:border-blue-600 transition-colors">
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
                  <p className="text-blue-600 text-sm animate-pulse">Uploading...</p>
                )}
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
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
                  className="flex-1 border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
                >
                  Add
                </button>
              </form>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-fade-in"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-red-500 text-xs hover:text-red-700 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className={`w-full py-2 rounded-lg text-white transition-all transform ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:scale-105"
                }`}
              >
                {uploading ? "Saving..." : "Submit & View Profile"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main profile view with fade-in animation
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      <br />
      <br />
      <div className="max-w-6xl mx-auto">
        {/* Profile Info - Full width on all screens */}
        <div className="col-span-full bg-white shadow-xl rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 transform animate-slide-up">
          <div className="flex items-center gap-4">
            <label className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-md cursor-pointer hover:border-blue-600 transition-all duration-300 hover:scale-105">
              <img
                src={profilePic || user.imageUrl || "/user.png"}
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
                  className="text-xl font-semibold text-blue-700 border-b border-blue-500 focus:border-blue-600 focus:outline-none transition-colors"
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
                      className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full flex items-center gap-1 animate-fade-in hover:bg-blue-200 transition-colors"
                      style={{animationDelay: `${idx * 0.1}s`}}
                    >
                      {skill}
                      {editMode && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-500 text-xs hover:text-red-700 transition-colors"
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
                    className="px-2 py-1 border rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transform hover:scale-105 transition-all"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* 🔥 ENHANCED Credits Section with Buy Credits and Redeem Button */}
          <div className="text-center min-w-[200px]">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 mb-3 border border-blue-100 hover:shadow-lg transition-shadow">
              <p className="text-lg font-medium text-blue-700 mb-1">Credits</p>
              <p className="text-3xl font-bold text-green-600 mb-4 animate-pulse">
                {credits.toLocaleString()}
              </p>

              {/* 🔥 NEW: Buy Credits Button */}
              <button
                onClick={handleBuyCredits}
                className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-white font-semibold py-2.5 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 group mb-3 w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-lg">💳</span>
                  <span>Buy Credits</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                </div>
              </button>

              {/* Redeem Button */}
              <button
                onClick={handleRedeemCredits}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white font-semibold py-2.5 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 group w-full"
                disabled={credits < 1000}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span className="text-lg">🪙</span>
                  <span>Redeem Credits</span>
                </div>
              </button>

              {credits < 1000 && (
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 1,000 credits required to redeem
                </p>
              )}
            </div>

            {/* Edit Profile Section */}
            <div className="mt-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-blue-600 underline text-sm hover:text-blue-800 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className={`px-4 py-1 rounded mt-2 text-white text-sm transition-all transform ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid layout for Calendar and Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🎨 Enhanced Calendar with Session Highlighting */}
          <div className="hidden lg:block bg-white shadow-xl rounded-xl p-6 transform animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2">
              📅 Calendar 
              {services.length > 0 && (
                <span className="text-sm text-green-600 font-normal animate-fade-in">
                  ({services.length} session{services.length !== 1 ? 's' : ''})
                </span>
              )}
            </h3>
            {services.length > 0 && (
              <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Sessions highlighted in green
              </p>
            )}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar 
                slots={{
                  day: CustomDay,
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Meeting UI - Full width on mobile, half width on laptop */}
          <div className="bg-white shadow-xl rounded-xl p-6 lg:col-span-1 col-span-1 transform animate-slide-up" style={{animationDelay: '0.4s'}}>
            <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2">
              📹 My Sessions
            </h3>

            {/* Services List */}
            <div className="space-y-4">
              {services.length === 0 ? (
                <p className="text-gray-400 italic">No session listed yet.</p>
              ) : (
                services.map((service, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 rounded-xl p-4 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow animate-fade-in"
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <div>
                      <p className="font-medium text-blue-800">
                        {service.name}
                      </p>
                      <p className="text-sm text-green-600">
                        Credits Required:{" "}
                        <span className="font-semibold">{service.credits}</span>
                      </p>
                      {service.time && (
                        <p className="text-sm text-gray-600">
                          Time:{" "}
                          {dayjs(service.time).format("DD MMM YYYY, hh:mm A")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="text-red-600 hover:underline text-sm hover:text-red-800 transition-colors"
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
                className="border rounded-md px-3 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <input
                type="number"
                placeholder="Credit required"
                value={serviceCredits}
                onChange={(e) => setServiceCredits(e.target.value)}
                className="border rounded-md px-3 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full transform hover:scale-105 transition-all"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Profile;
