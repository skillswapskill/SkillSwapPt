import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

import CareerPortal from "./components/CareerPage";
import JobDetail from "./components/JobDetail";
import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import Business from "./components/Business"
import Profile from "./components/Profile"

function App() {
  return (
    <Router>
      <NavBar />
      

      <Routes>
        <Route path="/" element={<Hero/>} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/careers" element={<CareerPortal />} />
        <Route path="/careers/frontend-dev" element={<JobDetail />} />
        <Route path="business" element={<Business/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
