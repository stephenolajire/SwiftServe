import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import Layout from "./layout/Layout";
import Landing from "./pages/Home";
import RegistrationForm from "./user/RegistrationForm";
import Login from "./user/Login";
import CourierListings from "./pages/ListingPage";
import Contact from "./pages/ContactUs";
import About from "./pages/About";
import BecomeCourier from "./pages/BecomeCourier";
import Dashboard from "./pages/Dashboard";
import CompanyRegistration from "./user/CompanyRegistration";
import RegistrationType from "./constant/RegistrationType";
import IndividualDashboard from "./Dashboard/IndividualDashboard";
import CompanyDashboard from "./Dashboard/CompanyDashboard";
import WorkerRegistration from "./user/WorkerRegistration";
import WorkerDashboard from "./Dashboard/WorkerDashboard";
import ClientDashboard from "./Dashboard/ClientDashboard";
import DeliveryForm from "./user/DeliveryForm";
import KYCVerification from "./pages/KYCVerification";
import ProtectedRoute from "./constant/ProtectedRoute";
import ClientRegistration from "./user/ClientRegistration";
import AdminDashboard from "./Dashboard/AdminDashboard";
import KYCPendingStatus from "./pages/KYCPendingStatus";
import NotFound from "./pages/NotFound";
import UserDetails from "./pages/UserDetails";
import ForgotPassword from "./user/ForgotPassword";
import VerifyPasswordOTP from "./user/VerifyPasswordOTP";
import ResetPassword from "./user/ResetPassword";
import ScrollToTop from "./components/ScrollToTop";
import PaymentCallback from "./components/PaymentCallBack";

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="listing" element={<CourierListings />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="courier" element={<BecomeCourier />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="individual/dashboard"
            element={<IndividualDashboard />}
          />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/dashboard"
            element={
              <ProtectedRoute>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="worker/dashboard"
            element={
              <ProtectedRoute>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="client/dashboard"
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/users/:id" element={<UserDetails />} />
        </Route>
        <Route path="/individual" element={<RegistrationForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/company" element={<CompanyRegistration />} />
        <Route path="/register" element={<RegistrationType />} />
        <Route path="/register/client" element={<ClientRegistration />} />
        <Route path="/worker" element={<WorkerRegistration />} />
        <Route path="/kyc-status" element={<KYCPendingStatus />} />
        <Route path="/add-item" element={<DeliveryForm />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyPasswordOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route
          path="/kyc"
          element={
            <ProtectedRoute>
              <KYCVerification />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
