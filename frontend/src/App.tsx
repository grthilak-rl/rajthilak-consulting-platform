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
import PortfolioManagement from "./pages/PortfolioManagement";
import CaseStudyForm from "./pages/CaseStudyForm";
import SiteManagement from "./pages/SiteManagement";
import SiteContentForm from "./pages/SiteContentForm";
import AcceptInvite from "./pages/AcceptInvite";
import Register from "./pages/Register";
import ClientPortal from "./pages/ClientPortal";
import ClientRequirementDetail from "./pages/ClientRequirementDetail";
import UserManagement from "./pages/UserManagement";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<CaseStudyDetail />} />
      <Route path="/services/:slug" element={<ServiceDetail />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/submit" element={<ContactPage />} />

      {/* Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/invite/:token" element={<AcceptInvite />} />
      <Route path="/register" element={<Register />} />

      {/* Admin only */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/requirements/:id" element={<ProtectedRoute allowedRoles={["admin"]}><RequirementDetail /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>} />

      {/* Admin + Editor */}
      <Route path="/admin/portfolio" element={<ProtectedRoute allowedRoles={["admin", "editor"]}><PortfolioManagement /></ProtectedRoute>} />
      <Route path="/admin/portfolio/:id" element={<ProtectedRoute allowedRoles={["admin", "editor"]}><CaseStudyForm /></ProtectedRoute>} />
      <Route path="/admin/site" element={<ProtectedRoute allowedRoles={["admin", "editor"]}><SiteManagement /></ProtectedRoute>} />
      <Route path="/admin/site/:id" element={<ProtectedRoute allowedRoles={["admin", "editor"]}><SiteContentForm /></ProtectedRoute>} />

      {/* Client portal */}
      <Route path="/portal" element={<ProtectedRoute allowedRoles={["client"]}><ClientPortal /></ProtectedRoute>} />
      <Route path="/portal/requirements/:id" element={<ProtectedRoute allowedRoles={["client"]}><ClientRequirementDetail /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
