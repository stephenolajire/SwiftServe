import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import React from 'react'
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div>
      <Navigation />
      <Outlet />
      <Footer/>
    </div>
  )
}

export default Layout
