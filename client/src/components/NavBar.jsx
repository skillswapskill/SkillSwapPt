import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SignOutButton } from "@clerk/clerk-react";

function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
              to="/business"
              className="hover:opacity-80 transition-all hidden sm:inline"
            >
              Business
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
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
              >
                <UserIcon className="w-5 h-5 text-gray-600" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
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
