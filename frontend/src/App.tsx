import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import ServiceDetail from "./pages/ServiceDetail";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import RequirementDetail from "./pages/RequirementDetail";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<CaseStudyDetail />} />
      <Route path="/services/:slug" element={<ServiceDetail />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/submit" element={<ContactPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/requirements/:id" element={<ProtectedRoute><RequirementDetail /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
