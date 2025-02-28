import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import React from 'react'

const Layout = () => {
  return (
    <div>
      <Navigation />
      <Outlet />
    </div>
  )
}

export default Layout
