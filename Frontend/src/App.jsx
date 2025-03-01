import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import Layout from './layout/Layout';
import Home from './pages/Home';
import RegistrationForm from './user/RegistrationForm';
import Login from './user/Registration';
import CourierListings from './pages/ListingPage';


const App = () => { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="listing" element={<CourierListings />} />
        </Route>
        <Route path='/register' element={<RegistrationForm/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </Router>
  )
}

export default App;