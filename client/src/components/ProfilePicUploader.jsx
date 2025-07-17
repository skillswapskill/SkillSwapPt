// ProfilePicUploader.jsx

import React, { useState } from "react";
import axios from "axios";

const ProfilePicUploader = ({ clerkId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("clerkId", clerkId);

    try {
      // Adjust endpoint if needed; see backend update below
      const res = await axios.post(
        "http://localhost:5000/api/users/upload-profile-pic",
        formData,
        { withCredentials: true }
      );
      onUploadSuccess(res.data.profilePic); // Pass back new image URL
    } catch (err) {
      alert("Failed to upload: " + err.message);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};
export default ProfilePicUploader;
