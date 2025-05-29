import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CareerPortal from "./components/CareerPage";
import JobDetail from "./components/JobDetail";
import NavBar from "./components/NavBar"
import Hero from "./components/Hero"
import Footer from "./components/Footer"

function App() {
  return (
    
    <Router>
      <NavBar/>
      <Hero/>
      <Routes>

        {/* <Route path="/" element={<h1>Welcome to SkillSwap</h1>} /> */}
        {/* <Route path="/careers" element={<CareerPortal />} />
        <Route path="/careers/frontend-dev" element={<JobDetail />} /> */}

      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
