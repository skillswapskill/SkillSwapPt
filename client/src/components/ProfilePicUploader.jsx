import React, { useState } from "react";

// ✅ Import the dynamic API client instead of axios
import { apiClient } from '../config/api';

const ProfilePicUploader = ({ clerkId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ File validation
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      // ✅ Create preview URL
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("clerkId", clerkId);

    try {
      // ✅ Using apiClient instead of hardcoded localhost URL
      const res = await apiClient.post(
        "/api/users/upload-profile-pic",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // ✅ Success handling
      onUploadSuccess(res.data.profilePic); // Pass back new image URL
      alert('Profile picture uploaded successfully!');
      
      // ✅ Clean up
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Upload failed';
      alert("Failed to upload: " + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="profile-pic-uploader">
      {/* ✅ Enhanced file input with styling */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Profile Picture
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          disabled={uploading}
        />
      </div>

      {/* ✅ Preview section */}
      {previewUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
          />
        </div>
      )}

      {/* ✅ Enhanced upload button */}
      <button 
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
          (!selectedFile || uploading)
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
        }`}
      >
        {uploading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </span>
        ) : (
          'Upload Profile Picture'
        )}
      </button>
    </div>
  );
};

export default ProfilePicUploader;
