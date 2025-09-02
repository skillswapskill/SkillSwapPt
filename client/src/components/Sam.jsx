import React, { useEffect, useState } from "react";
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
  const [status, setStatus] = useState("Say 'sam on' to begin");
  const navigate = useNavigate();

  // ✅ Command map with multiple variations for each route
  const commandMap = {
    "/": ["home", "go home", "navigate home", "open home", "take me home"],
    "/dashboard": ["dashboard", "open dashboard", "go to dashboard", "navigate dashboard"],
    "/profile": ["profile", "my profile", "open profile", "navigate profile"],
    "/careers": ["careers", "open careers", "job opportunities", "go to careers","career","career portal"],
    "/my-learning": ["my learning", "open my learning", "learning page", "go to learning"],
    "/team": ["team", "our team", "show team", "navigate team", "team members"],
    "/contact": ["contact", "contact us", "help page", "support"],
    "/aboutus": ["about", "about us", "go to about", "navigate about"],
    "/support": ["support", "help", "customer support", "get help"],
    "/terms": ["terms", "terms and conditions", "open terms", "navigate terms"],
    "/privacy": ["privacy", "privacy policy", "open privacy", "navigate privacy"],
    "/sign-in": ["sign in", "log in", "login", "open sign in", "navigate sign in"],
    "/sign-up": ["sign up", "register", "create account", "open sign up", "navigate sign up"],
    "/business": ["business", "business page", "go to business", "navigate business"],
    "/book-session": ["book session", "book a session", "schedule session", "open book session", "navigate book session"],
    "/redeem": ["redeem", "redeem code", "apply code", "open redeem", "navigate redeem"],
    "/payment": ["payment", "payment page", "go to payment", "navigate payment"],
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Speech recogniti on not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("🎤 Heard:", transcript);

      // ✅ Activation
      if (transcript.includes("sam activate")||transcript.includes("sam on")) {
        if (!aiActive) {
          setAiActive(true);
          setStatus("✅ sam is active");
        }
        return;
      }

      // ✅ Deactivation
      if (transcript.includes("sam deactivate") || transcript.includes("sam off")) {
        if (aiActive) {
          setAiActive(false);
          setStatus("Say 'sam on' to begin");
        }
        return;
      }

      if (!aiActive) return;

      // ✅ Navigation lookup
      let matched = false;
      for (const [path, phrases] of Object.entries(commandMap)) {
        if (phrases.some(p => transcript.includes(p))) {
          navigateTo(path, `👉 Navigating to ${path === "/" ? "Home" : path.replace("/", "")}`);
          matched = true;
          break;
        }
      }

      if (!matched) setStatus("🤔 Unknown command");
    };

    recognition.start();

    return () => recognition.stop();
  }, [aiActive, navigate]);

  // ✅ Navigation helper
  function navigateTo(path, message) {
    navigate(path);
    setStatus(message);
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "10px",
      borderRadius: "15px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    }}>
      <AnimatedAiLogo isActive={aiActive} />
      <p style={{ margin: 0, fontWeight: 500 }}>{status}</p>
    </div>
  );
}