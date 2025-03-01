import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import Layout from './layout/Layout';
import Home from './pages/Home';
import RegistrationForm from './user/RegistrationForm';


const App = () => { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="about" element={<About />} /> */}
        </Route>
        <Route path='/register' element={<RegistrationForm/>}/>
      </Routes>
    </Router>
  )
}

export default App;