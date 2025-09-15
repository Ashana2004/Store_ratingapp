import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import RoleSelection from "./pages/roleselelction";
import NormalDashboard from "./pages/normaldashboard";
import OwnerDashboard from "./pages/ownerdashboard";
import AdminDashboard from "./pages/admindashboard";


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
