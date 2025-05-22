import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CareerPortal from "./components/CareerPage";
import JobDetail from "./components/JobDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to SkillSwap</h1>} />
        <Route path="/careers" element={<CareerPortal />} />
        <Route path="/careers/frontend-dev" element={<JobDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
