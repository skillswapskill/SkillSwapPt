import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import React, { useState, useEffect } from "react";

import CareerPortal from "./components/CareerPage";
import JobDetail from "./components/JobDetail";
import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import Business from "./components/Business"
import Profile from "./components/Profile"
import Dashboard from "./components/dashboard"
import ProfileClicked from "./components/ProfileClicked";
import Booking from "./components/Booking";
import { Toaster } from 'react-hot-toast';
import MyLearning from "./components/MyLearning";
import JoinRoom from './components/JoinRoom';
import Reedeem from "./components/Reedeem";
import PaymentPage from "./components/PaymentPage";




function App() {
  
  return (
    <Router>
      <NavBar />
      <Toaster 
          position="top-center" // Optional: Customize position, etc.
          toastOptions={{
            success: { duration: 4000 }, // Optional: Global options
          }}
        />
      

      <Routes>
        <Route path="/" element={<Hero/>} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/careers" element={<CareerPortal />} />
        <Route path="/careers/frontend-dev" element={<JobDetail />} />
        <Route path="business" element={<Business/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/profileclicked" element={<ProfileClicked />} />
        <Route path="/book-session" element={<Booking />} />
        <Route path="/my-learning" element={<MyLearning />} />
        <Route path="/join-room/:sessionId" element={<JoinRoom />} />
        <Route path="/redeem" element={<Reedeem />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>

      <Footer />
    </Router>
    
  );
}

export default App;
