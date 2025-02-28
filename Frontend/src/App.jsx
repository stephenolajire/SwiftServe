import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import Layout from './layout/Layout';
import Home from './pages/Home';


const App = () => { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="about" element={<About />} /> */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App;