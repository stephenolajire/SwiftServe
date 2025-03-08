import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import Layout from './layout/Layout';
import Landing from './pages/Home'
import RegistrationForm from './user/RegistrationForm';
import Login from './user/Registration';
import CourierListings from './pages/ListingPage';
import Contact from './pages/ContactUs';
import About from './pages/About';
import BecomeCourier from './pages/BecomeCourier';
import Dashboard from './pages/Dashboard';
import CompanyRegistration from './user/CompanyRegistration';
import RegistrationType from './constant/RegistrationType';
import IndividualDashboard from './Dashboard/IndividualDashboard';
import CompanyDashboard from './Dashboard/CompanyDashboard';
import WorkerRegistration from './user/WorkerRegistration';
import WorkerDashboard from './Dashboard/WorkerDashboard';
import ClientDashboard from './Dashboard/ClientDashboard';
import DeliveryForm from './user/DeliveryForm';


const App = () => { 
  return (
    <Router>
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
          <Route path="company/dashboard" element={<CompanyDashboard />} />
          <Route path="worker/dashboard" element={<WorkerDashboard />} />
          <Route path="client/dashboard" element={<ClientDashboard />} />
        </Route>
        <Route path="/individual" element={<RegistrationForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/company" element={<CompanyRegistration />} />
        <Route path="/register" element={<RegistrationType />} />
        <Route path="/worker" element={<WorkerRegistration />} />
        <Route path="/add-item" element={<DeliveryForm />} />
      </Routes>
    </Router>
  );
}

export default App;