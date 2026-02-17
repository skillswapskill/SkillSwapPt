import { BrowserRouter as Router } from "react-router-dom";
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
import Team from "./components/Team";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import Support from "./components/Support";
import Contact from "./components/Contact";
import AboutUs from "./components/AboutUs";
// import Sam from "./components/Sam";
import Community from "./components/Community";
import NotFound404 from "./components/NotFound404";
// import ClickSparkles from "./components/ClickSparkles";
import AnimatedRoutes from "./components/AnimatedRoutes";





function App() {

  return (
    <Router>
      {/* <ClickSparkles /> */}
      <NavBar />
      <Toaster
        position="top-center" // Optional: Customize position, etc.
        toastOptions={{
          success: { duration: 4000 }, // Optional: Global options
        }}
      />

      {/* <Sam/> */}
      <AnimatedRoutes />

      <Footer />
    </Router>

  );
}

export default App;
