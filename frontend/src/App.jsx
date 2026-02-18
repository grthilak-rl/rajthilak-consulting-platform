import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SubmitRequirement from "./pages/SubmitRequirement";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Portfolio from "./pages/Portfolio";
import RequirementDetail from "./pages/RequirementDetail";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/submit" element={<SubmitRequirement />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/requirements/:id" element={<ProtectedRoute><RequirementDetail /></ProtectedRoute>} />
    </Routes>
  );
}
