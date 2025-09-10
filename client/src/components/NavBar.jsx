import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { SignOutButton } from "@clerk/clerk-react";
import { useUser, useAuth } from "@clerk/clerk-react"; // ✅ Add useAuth
import { apiClient } from "../config/api";

function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth(); // ✅ Get auth token function

  /* ─── NOTIFICATION STATE ─────────────────────────────── */
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // ✅ Fixed notification fetching with auth headers
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoaded || !user) {
        // console.log("❌ User not ready for notification fetch:", { isLoaded, user: !!user });
        return;
      }

      setIsLoadingNotifications(true);
      try {
        // console.log("🚀 Fetching notifications...");
        
        // ✅ Get auth token from Clerk
        const token = await getToken();
        // console.log("🔑 Auth token obtained:", !!token);
        
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
        
        // console.log("✅ Raw API Response:", response);
        // console.log("📊 Response data:", response.data);
        // console.log("📋 Notifications array:", response.data.notification);
        // console.log("🔢 Notifications count:", response.data.notification?.length || 0);
        
        const notificationsData = response.data.notification || [];
        // console.log("💾 Setting notifications:", notificationsData);
        
        setNotifications(notificationsData);
      } catch (error) {
        console.error("❌ Full error object:", error);
        console.error("❌ Error response:", error.response);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error status:", error.response?.status);
        console.error("❌ Error data:", error.response?.data);
        setNotifications([]);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [isLoaded, user, getToken]); // ✅ Add getToken as dependency

  const unreadCount = useMemo(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    // console.log("🔔 Unread count:", count, "from", notifications.length, "total notifications");
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
    // console.log("📖 Marking notification as read:", notificationId);
    setNotifications((prev) =>
      prev.map((n) => {
        const currentId = n._id?.$oid || n._id;
        const targetId = notificationId?.$oid || notificationId;
        
        if (currentId === targetId) {
          // console.log("✅ Found matching notification to mark as read");
          return { ...n, isRead: true };
        }
        return n;
      })
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    // console.log("📖 Marking all notifications as read");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  // ✅ Fixed refresh notifications with auth
  const refreshNotifications = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingNotifications(true);
    try {
      // console.log("🔄 Manually refreshing notifications...");
      
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
              to="/community"
              className="hover:opacity-80 transition-all hidden sm:inline"
            >
              Community
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

            {/* ✨ SEXY Bell Icon for Notifications */}
            <div className="relative">
              <button
                onClick={() => setPanelOpen(!panelOpen)}
                className="relative p-3 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group hover:scale-110 hover:shadow-lg"
                aria-label="Notifications"
              >
                <BellIcon className="w-6 h-6 text-blue-800 group-hover:text-purple-600 transition-all duration-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-2xl ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* ✨ ULTRA SEXY Notification dropdown */}
              {panelOpen && (
                <div
                  ref={panelRef}
                  className="absolute right-0 top-full mt-3 w-96 bg-white rounded-2xl border-0 shadow-2xl max-h-[75vh] overflow-hidden z-50 transform transition-all duration-500 ease-out animate-in slide-in-from-top-3"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 50%, #f8faff 100%)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 25px -5px rgba(59, 130, 246, 0.1)'
                  }}
                >
                  {/* ✨ SEXY Header */}
                  <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 px-6 py-5 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xl tracking-tight">Notifications</span>
                        <p className="text-pink-100 text-sm mt-1">
                          {unreadCount > 0 ? `${unreadCount} new updates` : "All caught up!"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-full transition-all duration-300 font-medium hover:scale-105"
                          >
                            Mark all as read
                          </button>
                        )}
                        <button
                          onClick={refreshNotifications}
                          className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1 font-medium hover:scale-105"
                          disabled={isLoadingNotifications}
                        >
                          {isLoadingNotifications ? "⏳" : "🔄"} Refresh
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ✨ SEXY Notification list */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="py-16 text-center">
                        <div className="relative mx-auto w-16 h-16 mb-6">
                          <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-gray-600 text-lg font-medium">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                          <BellIcon className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-700 text-xl font-bold mb-2">You're all caught up! 🎉</p>
                        <p className="text-gray-500 text-sm">No new notifications</p>
                        <p className="text-xs mt-1 text-gray-400">
                          Debug: {notifications.length} notifications loaded
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="px-6 py-3 text-xs text-purple-600 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 font-semibold">
                          Debug: Showing {notifications.length} notifications
                        </div>
                        {notifications.map((n, index) => {
                          const notificationId = getNotificationId(n);
                          // console.log(`🔍 Rendering notification ${index}:`, n);
                          
                          return (
                            <button
                              key={notificationId || index}
                              onClick={() => {
                                markAsRead(n._id);
                                setPanelOpen(false);
                              }}
                              className={`w-full text-left px-6 py-4 flex gap-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg relative group ${
                                !n.isRead ? 
                                "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-l-4 border-purple-400 hover:from-blue-100 hover:via-purple-100 hover:to-pink-100" : 
                                "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50"
                              }`}
                            >
                              <div className="w-12 h-12 flex-none bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                <BellIcon className="w-6 h-6 text-purple-600" />
                              </div>

                              <div className="flex-1">
                                <p className={`text-sm leading-relaxed mb-2 ${!n.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                                  {n.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500 font-medium">
                                    {formatNotificationDate(n.createdAt)}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                      n.type === 'credit' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700' :
                                      n.type === 'welcome' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                                      'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
                                    }`}>
                                      {n.type}
                                    </span>
                                    {!n.isRead && (
                                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
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
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 overflow-hidden border-2 border-gray-300 hover:border-blue-400 transition-all duration-200"
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
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                  {/* User info section at the top */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
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
