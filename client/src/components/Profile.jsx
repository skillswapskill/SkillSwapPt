import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

function Profile() {
  const { user, isSignedIn } = useUser();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [skills, setSkills] = useState([]);
  const [inputSkill, setInputSkill] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [credits, setCredits] = useState(0);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn) return;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/users/sync",
          {
            clerkId: user?.id,
            name: user?.fullName,
            email: user?.primaryEmailAddress?.emailAddress,
          },
          { withCredentials: true }
        );

        const data = res.data;
        setCredits(data.totalCredits);
        setName(user?.fullName);
        if (data.showCongrats) {
          setShowCongrats(true);
        }
      } catch (err) {
        console.error("Failed to sync user:", err);
      }
    };

    syncUser();
  }, [isSignedIn]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (inputSkill.trim() && !skills.includes(inputSkill.trim())) {
      setSkills([...skills, inputSkill.trim()]);
      setInputSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleNext = () => {
    if (step === 1 && (!name || !profilePic)) return;
    setStep(step + 1);
  };

  const handleSubmit = () => {
    setProfileComplete(true);
  };

  const closeCongrats = () => {
    setShowCongrats(false);
  };

  if (profileComplete) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {showCongrats && (
          <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center text-center p-6 animate-fade-in-down">
            <h2 className="text-3xl font-bold text-green-600 mb-3">
              🎉 Congratulations!
            </h2>
            <p className="text-gray-700 mb-5">
              You've earned{" "}
              <span className="font-semibold text-blue-600">{credits} credits</span> for joining us!
            </p>
            <button
              onClick={closeCongrats}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
        <br>
        </br>
        <br>
        </br>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Info */}
          <div className="col-span-2 bg-white shadow-xl rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src={profilePic || user?.imageUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
              />
              <div>
                <h2 className="text-2xl font-semibold text-blue-700">{name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.length > 0 ? (
                    skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-sm">No skills added.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-blue-700">Credits</p>
              <p className="text-3xl font-bold text-green-600">{credits}</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white shadow-xl rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3  text-blue-700 flex items-center gap-2">
              📅 Calendar (Upcoming Sessions)
            </h3>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar />
            </LocalizationProvider>
          </div>

          {/* Meeting UI */}
          <div className="bg-white shadow-xl rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center gap-2">
              📹 Meeting UI
            </h3>
            <div className="text-gray-400 italic ">No Meetings Scheduled for now.</div>
          </div>
        </div>
      </div>
    );
  }

  // Setup form (step 1 and 2)
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
                className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
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
                placeholder="e.g. Web Development"
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default Profile;
