import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SubmitRequirement from "./pages/SubmitRequirement";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import RequirementDetail from "./pages/RequirementDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/submit" element={<SubmitRequirement />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/requirements/:id" element={<RequirementDetail />} />
    </Routes>
  );
}
