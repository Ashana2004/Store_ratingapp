import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import RoleSelection from "./pages/roleselelction";
import NormalDashboard from "./pages/normaldashboard";
import OwnerDashboard from "./pages/ownerdashboard";
import AdminDashboard from "./pages/admindashboard";
import "./styles/admindashboard.css";
import "./styles/modal.css";
import './styles/login.css';
import './styles/card-hover.css';
import './styles/modal.css';
import "./styles/normaldashboard.css"
import "./styles/changingText.css"; 
import "./styles/ownerDashboard.css";
import './styles/signup.css';
import './styles/card-hover.css'; // <-- new import
import "./styles/topbar.css";
import "./styles/modal.css";
import "./styles/changingText.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/roleselelction" element={<RoleSelection />} />
        <Route path="/normaldashboard" element={<NormalDashboard />} />
        <Route path="/dashboard/owner" element={<OwnerDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
