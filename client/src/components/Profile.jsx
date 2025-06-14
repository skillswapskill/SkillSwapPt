import React, { useState } from 'react';

function Profile() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = () => {
    const profileData = {
      name,
      profilePic,
      skills,
    };
    console.log('Profile Submitted:', profileData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-xl w-full max-w-md p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-blue-800">Create Your Profile</h2>

            <label className="flex flex-col items-center gap-2">
              <span className="font-medium text-gray-700">Profile Picture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input file-input-bordered w-full"
              />
              {profilePic && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 mt-2">
                  <img
                    src={profilePic}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </label>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-blue-800">Add Skills You Can Teach</h2>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Skill</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="e.g., JavaScript"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} className="text-red-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={skills.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
