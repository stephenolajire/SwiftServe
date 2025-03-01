import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import logo from "../assets/logoo.jpeg";
import style from "../css/Navigation.module.css";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={style.nav}>
      <div className={style.logo}>
        <img src={logo} alt="logo" />
      </div>
      <div className={`${style.links} ${isOpen ? style.active : ""}`}>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="about"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="courier"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              Become a courier
            </NavLink>
          </li>
          <li>
            <NavLink
              to="contact"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              Contact us
            </NavLink>
          </li>

          <li>
            <NavLink
              to="listing"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              Items
            </NavLink>
          </li>

          <li>
            <NavLink
              to="dashboard"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </NavLink>
          </li>

          <li className={style.authLinks}>
            <NavLink
              to="login"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              Login
            </NavLink>
          </li>

          <li className={style.authLinks}>
            <NavLink
              to="register"
              className={({ isActive }) =>
                isActive ? style.activeLink : style.link
              }
              onClick={() => setIsOpen(false)}
            >
              Signup
            </NavLink>
          </li>
        </ul>
      </div>
      <div className={style.auth}>
        <Link to="login">
          <button className={style.login}>Login</button>
        </Link>
        <Link to="register">
          <button className={style.signup}>Register</button>
        </Link>
      </div>

      <div className={style.hamburger} onClick={toggleMenu}>
        {isOpen ? <AiOutlineClose size={25} /> : <FaBars size={25} />}
      </div>
    </nav>
  );
};

export default Navigation;