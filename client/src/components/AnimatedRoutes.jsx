import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageLayout from './PageLayout';

// Import all pages
import CareerPortal from "./CareerPage";
import JobDetail from "./JobDetail";
import Hero from "./Hero";
import Login from "./Login";
import Register from "./Register";
import Business from "./Business"
import Profile from "./Profile"
import Dashboard from "./dashboard"
import ProfileClicked from "./ProfileClicked";
import Booking from "./Booking";
import MyLearning from "./MyLearning";
import JoinRoom from './JoinRoom';
import Reedeem from "./Reedeem";
import PaymentPage from "./PaymentPage";
import Team from "./Team";
import Terms from "./Terms";
import Privacy from "./Privacy";
import Support from "./Support";
import Contact from "./Contact";
import AboutUs from "./AboutUs";
// import Sam from "./Sam";
import Community from "./Community";
import NotFound404 from "./NotFound404";

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <Routes>
            <Route path="/" element={<PageLayout><Hero /></PageLayout>} />
            <Route path="/sign-in" element={<PageLayout><Login /></PageLayout>} />
            <Route path="/sign-up" element={<PageLayout><Register /></PageLayout>} />
            <Route path="/careers" element={<PageLayout><CareerPortal /></PageLayout>} />
            <Route path="/careers/frontend-dev" element={<PageLayout><JobDetail /></PageLayout>} />
            <Route path="business" element={<PageLayout><Business /></PageLayout>} />
            <Route path="/profile" element={<PageLayout><Profile /></PageLayout>} />
            <Route path="/dashboard" element={<PageLayout><Dashboard /></PageLayout>} />
            <Route path="/profileclicked" element={<PageLayout><ProfileClicked /></PageLayout>} />
            <Route path="/book-session" element={<PageLayout><Booking /></PageLayout>} />
            <Route path="/my-learning" element={<PageLayout><MyLearning /></PageLayout>} />
            <Route path="/join-room/:sessionId" element={<PageLayout><JoinRoom /></PageLayout>} />
            <Route path="/redeem" element={<PageLayout><Reedeem /></PageLayout>} />
            <Route path="/payment" element={<PageLayout><PaymentPage /></PageLayout>} />
            <Route path="/team" element={<PageLayout><Team /></PageLayout>} />
            <Route path="/terms" element={<PageLayout><Terms /></PageLayout>} />
            <Route path="/privacy" element={<PageLayout><Privacy /></PageLayout>} />
            <Route path="/support" element={<PageLayout><Support /></PageLayout>} />
            <Route path="/contact" element={<PageLayout><Contact /></PageLayout>} />
            <Route path="/aboutus" element={<PageLayout><AboutUs /></PageLayout>} />
            <Route path="/community" element={<PageLayout><Community /></PageLayout>} />
            <Route path="*" element={<PageLayout><NotFound404 /></PageLayout>} />
        </Routes>
    );
};

export default AnimatedRoutes;
