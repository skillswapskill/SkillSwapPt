import React from "react";
import { Link } from "react-router-dom";
import { UserIcon } from '@heroicons/react/24/outline';


function NavBar() {
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

          {/* Right: Nav Links (wrapped in one flex container) */}
          <div className="flex items-center gap-6 text-blue-800">
            <Link to="/business" className="hover:opacity-80 transition-all">
              <span className="hidden sm:inline">Business</span>
            </Link>
            <Link to="/mylearning" className="hover:opacity-80 transition-all">
              <span className="hidden sm:inline">My Learning</span>
            </Link>
            <Link to="/profile">
              <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
