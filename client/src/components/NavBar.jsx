import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { SignOutButton } from "@clerk/clerk-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { apiClient } from "../config/api";

// ✨ Loading Skeleton Components
const SkeletonLoader = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`}></div>
);

const NavBarSkeleton = () => (
  <header className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
    <div className="container mx-auto px-4 h-16">
      <div className="flex items-center justify-between h-full">
        {/* Left: Logo Skeleton */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-full"></div>
            <div className="w-20 md:w-24 h-5 md:h-6 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-[length:200%_100%] animate-pulse rounded"></div>
          </div>
        </div>

        {/* Right: Nav Links Skeleton */}
        <div className="flex items-center gap-2 md:gap-6 relative">
          {/* Desktop Navigation Links Skeleton */}
          <div className="hidden lg:flex items-center gap-4 md:gap-6">
            <SkeletonLoader className="w-16 h-4 md:w-20 md:h-5" />
            <SkeletonLoader className="w-18 h-4 md:w-22 md:h-5" />
            <SkeletonLoader className="w-14 h-4 md:w-16 md:h-5" />
            <SkeletonLoader className="w-20 h-4 md:w-24 md:h-5" />
          </div>

          {/* Notification Bell Skeleton */}
          <div className="relative">
            <div className="p-2 md:p-3 rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 bg-[length:200%_100%] animate-pulse">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 bg-[length:200%_100%] animate-pulse rounded"></div>
            </div>
            <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-pink-300 via-red-300 to-pink-300 bg-[length:200%_100%] animate-pulse rounded-full"></div>
          </div>

          {/* Profile Skeleton */}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-full border-2 border-gray-200"></div>
        </div>
      </div>
    </div>

    {/* Loading Bar */}
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
      <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer bg-[length:200%_100%]"></div>
    </div>
  </header>
);

function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  /* ─── NOTIFICATION STATE ─────────────────────────────── */
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // ✅ Fixed notification fetching with auth headers
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoaded || !user) {
        return;
      }

      setIsLoadingNotifications(true);
      try {
        const token = await getToken();
        
        if (!token) {
          console.error("❌ No auth token available");
          return;
        }

        const response = await apiClient.get('/api/notification', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const notificationsData = response.data.notification || [];
        setNotifications(notificationsData);
      } catch (error) {
        console.error("❌ Full error object:", error);
        setNotifications([]);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [isLoaded, user, getToken]);

  const unreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    return count;
  }, [notifications]);

  // Helper function to get the best available profile picture
  const getProfilePicture = () => {
    if (!user || !isLoaded) {
      return "https://www.shutterstock.com/image-vector/face-emoticon-icon-vector-logo-260nw-1714204030.jpg";
    }

    if (user.imageUrl) {
      return user.imageUrl;
    }

    if (user.profileImageUrl) {
      return user.profileImageUrl;
    }

    // Check external accounts (Google, etc.)
    if (user.externalAccounts && user.externalAccounts.length > 0) {
      const externalAccount = user.externalAccounts[0];
      if (externalAccount.imageUrl) {
        return externalAccount.imageUrl;
      }
      if (externalAccount.avatarUrl) {
        return externalAccount.avatarUrl;
      }
    }

    return "https://www.shutterstock.com/image-vector/face-emoticon-icon-vector-logo-260nw-1714204030.jpg";
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }

      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => {
        const currentId = n._id?.$oid || n._id;
        const targetId = notificationId?.$oid || notificationId;
        
        if (currentId === targetId) {
          return { ...n, isRead: true };
        }
        return n;
      })
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  // ✅ Fixed refresh notifications with auth
  const refreshNotifications = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingNotifications(true);
    try {
      const token = await getToken();
      if (!token) {
        console.error("❌ No auth token for refresh");
        return;
      }

      const response = await apiClient.get('/api/notification', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      setNotifications(response.data.notification || []);
    } catch (error) {
      console.error("❌ Error refreshing notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Helper function to get notification ID
  const getNotificationId = (notification) => {
    return notification._id?.$oid || notification._id;
  };

  // Helper function to format date
  const formatNotificationDate = (createdAt) => {
    try {
      let date;
      if (createdAt?.$date?.$numberLong) {
        // MongoDB format
        date = new Date(parseInt(createdAt.$date.$numberLong));
      } else if (createdAt) {
        // Regular format
        date = new Date(createdAt);
      } else {
        return "Unknown time";
      }
      return date.toLocaleTimeString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown time";
    }
  };

  // ✨ Show beautiful loading skeleton instead of "Loading..."
  if (!isLoaded) {
    return <NavBarSkeleton />;
  }

  return (
    <header className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-3 sm:px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 hover:opacity-80 transition-all"
            >
              <img
                src="/skillSwap.ico"
                alt="SkillSwap Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12"
              />
              <h1 className="text-sm sm:text-base md:text-lg font-medium text-blue-800">SkillSwap</h1>
            </Link>
          </div>

          {/* Right: Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-6 text-blue-800 relative">
            {/* Desktop Navigation Links */}
            <Link
              to="/dashboard"
              className="hover:opacity-80 transition-all hidden lg:inline text-sm md:text-base"
            >
              Dashboard
            </Link>
            <Link
              to="/community"
              className="hover:opacity-80 transition-all hidden lg:inline text-sm md:text-base"
            >
              Community
            </Link>
            <Link
              to="/careers"
              className="hover:opacity-80 transition-all hidden lg:inline text-sm md:text-base"
            >
              Careers
            </Link>
            <Link
              to="/my-learning"
              className="hover:opacity-80 transition-all hidden lg:inline text-sm md:text-base"
            >
              My Learning
            </Link>

            {/* ✨ FULLY RESPONSIVE Bell Icon for Notifications */}
            <div className="relative">
              <button
                onClick={() => setPanelOpen(!panelOpen)}
                className="relative p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group hover:scale-110 hover:shadow-lg"
                aria-label="Notifications"
              >
                <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-800 group-hover:text-purple-600 transition-all duration-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 md:-top-2 md:-right-2 min-w-4 h-4 sm:min-w-5 sm:h-5 md:min-w-6 md:h-6 px-0.5 sm:px-1 md:px-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-2xl ring-1 sm:ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* ✨ PERFECTLY RESPONSIVE Notification dropdown */}
              {panelOpen && (
                <div
                  ref={panelRef}
                  className="fixed inset-x-3 sm:inset-x-4 md:absolute md:inset-x-auto md:right-0 
                           top-20 md:top-full md:mt-3 
                           max-w-full sm:max-w-sm md:max-w-md lg:w-96 
                           bg-white rounded-lg md:rounded-xl lg:rounded-2xl 
                           border border-gray-100 md:border-0 shadow-xl md:shadow-2xl 
                           max-h-[calc(100vh-6rem)] md:max-h-[75vh] overflow-hidden z-50 
                           transform transition-all duration-300 ease-out"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 50%, #f8faff 100%)',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 20px 40px -12px rgba(59, 130, 246, 0.1)'
                  }}
                >
                  {/* ✨ MOBILE-OPTIMIZED Header */}
                  <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-base sm:text-lg md:text-xl tracking-tight">Notifications</span>
                        <p className="text-pink-100 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">
                          {unreadCount > 0 ? `${unreadCount} new updates` : "All caught up!"}
                        </p>
                      </div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-300 font-medium hover:scale-105 whitespace-nowrap"
                          >
                            <span className="hidden xs:inline">Mark all read</span>
                            <span className="xs:hidden">✓</span>
                          </button>
                        )}
                        <button
                          onClick={refreshNotifications}
                          className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-300 flex items-center gap-1 font-medium hover:scale-105"
                          disabled={isLoadingNotifications}
                        >
                          {isLoadingNotifications ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "🔄"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ✨ MOBILE-FIRST Notification list */}
                  <div className="max-h-[calc(100vh-12rem)] sm:max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="py-8 sm:py-12 md:py-16 text-center px-3 sm:px-4">
                        {/* Beautiful Loading Animation */}
                        <div className="relative mx-auto w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-4 sm:mb-6">
                          <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                          <div className="absolute inset-2 rounded-full border-2 border-pink-200"></div>
                          <div className="absolute inset-2 rounded-full border-2 border-pink-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base md:text-lg font-medium">Loading notifications...</p>
                        <div className="mt-3 sm:mt-4 flex justify-center space-x-1 sm:space-x-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 sm:py-12 md:py-16 text-center px-3 sm:px-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 shadow-2xl">
                          <BellIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <p className="text-gray-700 text-base sm:text-lg md:text-xl font-bold mb-2">You're all caught up! 🎉</p>
                        <p className="text-gray-500 text-xs sm:text-sm">No new notifications</p>
                        <p className="text-[10px] sm:text-xs mt-1 text-gray-400">
                          Debug: {notifications.length} notifications loaded
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-xs text-purple-600 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 font-semibold">
                          Debug: Showing {notifications.length} notifications
                        </div>
                        {notifications.map((n, index) => {
                          const notificationId = getNotificationId(n);
                          
                          return (
                            <button
                              key={notificationId || index}
                              onClick={() => {
                                markAsRead(n._id);
                                setPanelOpen(false);
                              }}
                              className={`w-full text-left px-3 sm:px-4 md:px-6 py-3 md:py-4 flex gap-2 sm:gap-3 md:gap-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm relative group ${
                                !n.isRead ? 
                                "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-l-4 border-purple-400 hover:from-blue-100 hover:via-purple-100 hover:to-pink-100" : 
                                "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50"
                              }`}
                            >
                              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-none bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                                <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2 ${!n.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"} break-words pr-1`}>
                                  {n.message}
                                </p>
                                <div className="flex items-center justify-between flex-wrap gap-1 sm:gap-2">
                                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                    {formatNotificationDate(n.createdAt)}
                                  </p>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <span className={`text-[10px] sm:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-semibold ${
                                      n.type === 'credit' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700' :
                                      n.type === 'welcome' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                                      'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                                    }`}>
                                      {n.type}
                                    </span>
                                    {!n.isRead && (
                                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-sm flex-shrink-0"></div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1 break-all leading-tight">
                                  ID: {notificationId} | Type: {n.type} | Read: {n.isRead ? "✅" : "❌"}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 overflow-hidden border-2 border-gray-300 hover:border-blue-400 transition-all duration-200"
                title={user?.firstName ? `${user.firstName}'s Profile` : "Profile"}
              >
                <img
                  src={getProfilePicture()}
                  alt={user?.firstName ? `${user.firstName}'s profile` : "Profile"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://www.shutterstock.com/image-vector/face-emoticon-icon-vector-logo-260nw-1714204030.jpg";
                  }}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white shadow-lg rounded-md py-2 z-50 border border-gray-100">
                  {/* User info section at the top */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.primaryEmailAddress?.emailAddress || ""}
                    </p>
                  </div>
                  <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Home
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <Link to="/Community" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Community
                  </Link>
                  <Link to="/my-learning" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Learning
                  </Link>
                  <Link to="/redeem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Redeem Credits
                  </Link>
                  <Link to="/payment" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
