import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SignOutButton } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";

function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isLoaded } = useUser();

  // ✅ CORRECTED: Helper function to get the best available profile picture
  const getProfilePicture = () => {
    if (!user || !isLoaded) {
      console.log("User not loaded or doesn't exist");
      return "https://www.shutterstock.com/image-vector/face-emoticon-icon-vector-logo-260nw-1714204030.jpg";
    }
    
    
    // ✅ CORRECTED: Use camelCase properties (React Clerk SDK)
    // Priority order for profile pictures
    if (user.imageUrl) {
      console.log("Using user.imageUrl:", user.imageUrl);
      return user.imageUrl;
    }
    
    if (user.profileImageUrl) {
      console.log("Using user.profileImageUrl:", user.profileImageUrl);
      return user.profileImageUrl;
    }
    
    // Check external accounts (Google, etc.)
    if (user.externalAccounts && user.externalAccounts.length > 0) {
      const externalAccount = user.externalAccounts[0];
      if (externalAccount.imageUrl) {
        console.log("Using external account imageUrl:", externalAccount.imageUrl);
        return externalAccount.imageUrl;
      }
      if (externalAccount.avatarUrl) {
        console.log("Using external account avatarUrl:", externalAccount.avatarUrl);
        return externalAccount.avatarUrl;
      }
    }
    
    // Fallback to default image
    console.log("Falling back to default image");
    return "https://www.shutterstock.com/image-vector/face-emoticon-icon-vector-logo-260nw-1714204030.jpg";
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Don't render until user is loaded
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <header className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <img
                src="/skillSwap.ico"
                alt="SkillSwap Logo"
                className="w-12 h-12"
              />
              <h1 className="text-lg font-medium text-blue-800">SkillSwap</h1>
            </Link>
          </div>

          {/* Right: Nav Links */}
          <div className="flex items-center gap-6 text-blue-800 relative">
            <Link
              to="/dashboard"
              className="hover:opacity-80 transition-all hidden sm:inline"
            >
              Dashboard
            </Link>
            <Link
              to="/careers"
              className="hover:opacity-80 transition-all hidden sm:inline"
            >
              Careers
            </Link>
            <Link
              to="/my-learning"
              className="hover:opacity-80 transition-all hidden sm:inline"
            >
              My Learning
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 overflow-hidden border-2 border-gray-300 hover:border-blue-400 transition-all duration-200"
                title={user?.firstName ? `${user.firstName}'s Profile` : "Profile"}
              >
                <img 
                  src={getProfilePicture()} 
                  alt={user?.firstName ? `${user.firstName}'s profile` : "Profile"}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log("✅ Image loaded successfully:", getProfilePicture())}
                  onError={(e) => {
                    console.error("❌ Image failed to load:", e.target.src);
                    // Fallback if image fails to load
                    e.target.src = "https://www.shutterstock.com/image-vector/face-emoticon-icon-vector-logo-260nw-1714204030.jpg";
                  }}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                  {/* User info section at the top */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || "User"
                      }
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.primaryEmailAddress?.emailAddress || ""}
                    </p>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Home
                  </Link>
                  <Link
                    to="/my-learning"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Learning
                  </Link>
                  <Link
                    to="/redeem"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Redeem Credits
                  </Link>
                  <Link
                    to="/payment"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Buy Credits
                  </Link>
                  <SignOutButton>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
