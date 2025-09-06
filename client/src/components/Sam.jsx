import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Animated AI Logo Component
const AnimatedAiLogo = ({ isActive }) => {
  const svgStyle = {
    width: "50px",
    height: "50px",
    filter: isActive ? "none" : "grayscale(0%)",
    transition: "filter 0.3s ease",
  };

  return (
    <svg style={svgStyle} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotate-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes dash-flow { to { stroke-dashoffset: -1000; } }

        .rotating-group-1 { animation: rotate 20s linear infinite; transform-origin: 150px 150px; }
        .rotating-group-2 { animation: rotate-reverse 30s linear infinite; transform-origin: 150px 150px; }
        .center-pulse { animation: pulse 4s ease-in-out infinite; transform-origin: 150px 150px; }
        .data-stream { stroke-dasharray: 20, 30; stroke-dashoffset: 0; animation: dash-flow 60s linear infinite; }
      `}</style>
      <defs>
        <radialGradient id="aiGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: "#9937D3", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#2792dc", stopOpacity: 1 }} />
        </radialGradient>
        <mask id="segmentedMask">
          <rect width="300" height="300" fill="white" />
          <line x1="150" y1="0" x2="150" y2="300" stroke="black" strokeWidth="8" />
          <line x1="0" y1="150" x2="300" y2="150" stroke="black" strokeWidth="8" />
          <line x1="45" y1="45" x2="255" y2="255" stroke="black" strokeWidth="8" />
          <line x1="255" y1="45" x2="45" y2="255" stroke="black" strokeWidth="8" />
        </mask>
      </defs>
      <g className="rotating-group-2">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#2792dc" strokeWidth="1" className="data-stream" opacity="0.5"/>
        <circle cx="150" cy="150" r="120" fill="url(#aiGradient)" mask="url(#segmentedMask)" opacity="0.7"/>
        <g stroke="#2792dc" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
          <line x1="150" y1="20" x2="150" y2="280" />
          <line x1="20" y1="150" x2="280" y2="150" />
          <line x1="55" y1="55" x2="245" y2="245" />
          <line x1="245" y1="55" x2="55" y2="245" />
        </g>
      </g>
      <g className="rotating-group-1">
        <circle cx="150" cy="150" r="95" fill="url(#aiGradient)" mask="url(#segmentedMask)" opacity="0.8"/>
        <circle cx="150" cy="150" r="105" fill="none" stroke="#9937D3" strokeWidth="1.5" className="data-stream" opacity="0.6"/>
      </g>
      <g className="center-pulse">
        <circle cx="150" cy="150" r="60" fill="url(#aiGradient)"/>
        <circle cx="150" cy="150" r="50" fill="#1a1a1a" opacity="0.3"/>
        <circle cx="150" cy="150" r="40" fill="url(#aiGradient)" />
      </g>
    </svg>
  );
};

export default function Sam() {
  const [aiActive, setAiActive] = useState(false);
  const [status, setStatus] = useState("Initializing Sam...");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  
  const recognitionRef = useRef(null);
  const isRecognitionRunning = useRef(false);
  const aiActiveRef = useRef(false); // ✅ Use ref to track state immediately

  // ✅ Update ref whenever state changes
  useEffect(() => {
    aiActiveRef.current = aiActive;
    console.log("🔄 aiActive state changed to:", aiActive);
  }, [aiActive]);

  // ✅ Command map
  const commandMap = {
  "/": [
    "home", "homepage", "main page", "go home", "take me home", "navigate home", 
    "open home", "back to home", "go to home", "main", "landing page", "start page", 
    "front page", "beginning", "index", "root", "base"
  ],
  
  "/dashboard": [
    "dashboard", "dash", "main dashboard", "go to dashboard", "open dashboard", 
    "navigate dashboard", "user dashboard", "my dashboard", "control panel", 
    "admin panel", "overview", "summary", "hub"
  ],
  
  "/profile": [
    "profile", "my profile", "user profile", "go to profile", "open profile", 
    "navigate profile", "account", "my account", "personal profile", "edit profile", 
    "profile settings", "user info", "personal info", "account settings", 
    "my info", "account details"
  ],
  
  "/careers": [
    "career", "careers", "jobs", "job opportunities", "go to careers", "open careers", 
    "navigate careers", "job portal", "career portal", "job board", "employment", 
    "hiring", "work", "find jobs", "job search", "opportunities", "vacancies", 
    "positions", "openings", "job listings", "apply for jobs","couriers"
  ],
  
  "/my-learning": [
    "learning", "my learning", "go to learning", "open my learning", "navigate learning", 
    "courses", "my courses", "education", "training", "lessons", "study", "learn", 
    "coursework", "classes", "tutorials", "learning materials", "educational content", 
    "skills training", "online courses", "progress", "learning progress"
  ],
  
  "/team": [
    "team", "our team", "go to team", "open team", "navigate team", "show team", 
    "team members", "staff", "people", "meet the team", "team page", "about team", 
    "employees", "crew", "personnel", "members", "who we are", "our people"
  ],
  
  "/contact": [
    "contact", "contact us", "go to contact", "open contact", "navigate contact", 
    "get in touch", "reach out", "help", "support", "customer service", 
    "assistance", "contact page", "contact info", "get help", "talk to us", 
    "customer support", "technical support", "reach us", "contact details"
  ],
  
  "/aboutus": [
    "about", "about us", "go to about", "open about", "navigate about", 
    "who we are", "company info", "our story", "learn more", "information", 
    "company", "organization", "mission", "vision", "history", "background", 
    "what we do", "company profile", "overview"
  ],
  
  "/support": [
    "support", "help", "customer support", "get help", "need help", "assistance", 
    "go to support", "open support", "navigate support", "help desk", "help center", 
    "technical support", "troubleshoot", "faq", "frequently asked questions", 
    "help page", "support center", "customer help", "service desk"
  ],
  
  "/terms": [
    "terms", "terms and conditions", "go to terms", "open terms", "navigate terms", 
    "legal", "agreement", "user agreement", "tos", "terms of service", 
    "terms of use", "legal terms", "conditions", "user terms", "service terms"
  ],
  
  "/privacy": [
    "privacy", "privacy policy", "go to privacy", "open privacy", "navigate privacy", 
    "data policy", "privacy terms", "data protection", "privacy settings", 
    "data privacy", "privacy statement", "data usage", "privacy notice"
  ],
  
  "/sign-in": [
    "sign in", "login", "log in", "go to sign in", "open sign in", "navigate sign in", 
    "sign me in", "authenticate", "enter account", "access account", "log into account", 
    "signin", "member login", "user login", "account login", "get in", "enter"
  ],
  
  "/sign-up": [
    "sign up", "register", "create account", "go to sign up", "open sign up", 
    "navigate sign up", "join", "signup", "new account", "registration", 
    "create profile", "join us", "become member", "new user", "register account", 
    "create new account", "open account", "start account"
  ],
  
  "/business": [
    "business", "for business", "go to business", "open business", "navigate business", 
    "enterprise", "corporate", "business solutions", "business page", "b2b", 
    "business services", "enterprise solutions", "commercial", "business portal", 
    "company services", "business offerings"
  ],
  
  "/book-session": [
    "book session", "book a session", "schedule session", "go to book session", 
    "open book session", "navigate book session", "schedule", "appointment", 
    "book appointment", "reserve", "booking", "make appointment", "set appointment", 
    "schedule meeting", "book meeting", "reserve session", "session booking", 
    "appointment booking", "schedule time", "book time"
  ],
  
  "/redeem": [
    "redeem", "redeem code", "go to redeem", "open redeem", "navigate redeem", 
    "apply code", "coupon", "voucher", "promo code", "discount code", "gift code", 
    "referral code", "promotional code", "use code", "enter code", "claim code", 
    "activate code", "code redemption", "apply coupon", "use voucher"
  ],
  
  "/payment": [
    "payment", "pay", "go to payment", "open payment", "navigate payment", 
    "billing", "checkout", "purchase", "buy", "transaction", "payment page", 
    "make payment", "process payment", "complete payment", "pay now", "billing info", 
    "payment method", "credit card", "payment details", "financial", "money", 
    "subscription", "upgrade", "premium"
  ]
};

  // ✅ Command matching function
  const matchCommand = (transcript) => {
    const cleaned = transcript.replace(/sam,?\s*/gi, '').trim();
    console.log("🧹 Cleaned command:", cleaned);

    for (const [path, phrases] of Object.entries(commandMap)) {
      for (const phrase of phrases) {
        if (cleaned.includes(phrase)) {
          console.log("✅ MATCHED:", phrase, "->", path);
          return path;
        }
      }
    }
    return null;
  };

  // ✅ Navigation helper
  const navigateTo = (path, message) => {
    console.log("🚀 Navigating to:", path);
    navigate(path);
    setStatus(message);
    setTimeout(() => setStatus("✅ Sam is listening..."), 2000);
  };

  // ✅ Safe recognition start
  const safeStartRecognition = (recognition) => {
    if (!isRecognitionRunning.current) {
      try {
        recognition.start();
        isRecognitionRunning.current = true;
      } catch (error) {
        console.log("Recognition start error:", error.message);
      }
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setStatus("❌ Speech recognition not supported");
      return;
    }

    // Enhanced audio setup
    navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      }
    }).catch(err => console.error("Mic error:", err));

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRecognitionRunning.current = true;
      setIsListening(true);
      setStatus("🎤 Sam ready - Say 'sam on' to activate");
      console.log("✅ Recognition started");
    };

    recognition.onend = () => {
      isRecognitionRunning.current = false;
      setIsListening(false);
      console.log("🔄 Recognition ended, restarting...");
      
      setTimeout(() => {
        if (recognitionRef.current) {
          safeStartRecognition(recognition);
        }
      }, 500);
    };

    recognition.onerror = (event) => {
      isRecognitionRunning.current = false;
      console.error("❌ Recognition error:", event.error);
      
      if (event.error === 'not-allowed') {
        setStatus("🚫 Microphone permission required");
      } else if (event.error !== 'aborted') {
        setTimeout(() => safeStartRecognition(recognition), 1000);
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("🎤 RAW Heard:", transcript);
      console.log("🔍 Current aiActive state:", aiActiveRef.current);

      // ✅ Activation - use callback to ensure state updates
      if (transcript.includes("sam on") || transcript.includes("sam activate")) {
        console.log("🟢 ACTIVATING SAM");
        setAiActive(true);
        aiActiveRef.current = true; // ✅ Immediately update ref
        setStatus("✅ Sam activated! Try: 'sam, go to dashboard'");
        return;
      }

      // ✅ Deactivation
      if (transcript.includes("sam off") || transcript.includes("sam deactivate")) {
        console.log("🔴 DEACTIVATING SAM");
        setAiActive(false);
        aiActiveRef.current = false; // ✅ Immediately update ref
        setStatus("🎤 Sam ready - Say 'sam on' to activate");
        return;
      }

      // ✅ Check active state using ref (immediate)
      if (!aiActiveRef.current) {
        console.log("⚠️ Sam not active, ignoring command");
        return;
      }

      console.log("✅ Sam is ACTIVE, processing command:", transcript);

      // ✅ Try to match navigation command
      const matchedPath = matchCommand(transcript);
      
      if (matchedPath) {
        console.log("🎯 NAVIGATING TO:", matchedPath);
        const pageName = matchedPath === "/" ? "Home" : matchedPath.replace("/", "").replace("-", " ");
        navigateTo(matchedPath, `✅ Going to ${pageName}`);
      } else {
        console.log("❌ NO MATCH FOUND for:", transcript);
        setStatus(`🤔 Try: "sam, go to dashboard" or "sam, go to career"`);
        setTimeout(() => setStatus("✅ Sam is listening..."), 3000);
      }
    };

    recognitionRef.current = recognition;
    setTimeout(() => safeStartRecognition(recognition), 500);

    return () => {
      isRecognitionRunning.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [navigate]);

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: aiActive 
        ? "rgba(153, 55, 211, 0.15)" 
        : "rgba(255, 255, 255, 0.9)",
      padding: "12px 16px",
      borderRadius: "20px",
      boxShadow: aiActive 
        ? "0 6px 20px rgba(153, 55, 211, 0.4)" 
        : "0 4px 12px rgba(0,0,0,0.15)",
      border: aiActive 
        ? "2px solid rgba(153, 55, 211, 0.5)" 
        : "1px solid rgba(0,0,0,0.1)",
      transition: "all 0.4s ease",
      maxWidth: "380px"
    }}>
      <AnimatedAiLogo isActive={aiActive} />
      
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{status}</p>
          {isListening && (
            <div style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#22c55e",
              borderRadius: "50%",
              animation: "pulse 2s infinite"
            }} />
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <p style={{ 
            margin: 0, 
            fontSize: "11px", 
            color: "#666",
            fontStyle: "italic"
          }}>
            🎧 Enhanced noise cancellation
          </p>
          {aiActive && (
            <span style={{
              fontSize: "10px",
              backgroundColor: "#22c55e",
              color: "white",
              padding: "2px 6px",
              borderRadius: "8px",
              fontWeight: "bold"
            }}>
              ACTIVE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
