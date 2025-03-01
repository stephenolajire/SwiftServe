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


const App = () => { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="listing" element={<CourierListings />} />
          <Route path='contact' element={<Contact/>}/>
          <Route path='about' element={<About/>} />
          <Route path='courier' element={<BecomeCourier/>}/>
          <Route path='dashboard' element={<Dashboard/>}/>
        </Route>
        <Route path='/register' element={<RegistrationForm/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </Router>
  )
}

export default App;