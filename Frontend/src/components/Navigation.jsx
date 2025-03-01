import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { MdArrowDropDown } from "react-icons/md";
import logo from "../assets/logoo.jpeg";
import style from "../css/Navigation.module.css";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdowns = () => {
    setShowRegisterDropdown(false);
    setShowSignupDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div className={style.authLink} ref={dropdownRef}>
            <div
              className={style.registerDropdown}
              onMouseEnter={() => setShowRegisterDropdown(true)}
              onMouseLeave={() => setShowRegisterDropdown(false)}
            >
              <button className={style.signup}>
                Register
                <MdArrowDropDown className={style.dropdownIcon} />
              </button>
              {showRegisterDropdown && (
                <div className={style.dropdown}>
                  <Link
                    to="/register"
                    className={style.dropdownLink}
                    onClick={closeDropdowns}
                  >
                    Individual
                  </Link>
                  <Link
                    to="/company"
                    className={style.dropdownLink}
                    onClick={closeDropdowns}
                  >
                    Company
                  </Link>
                </div>
              )}
            </div>
          </div>
        </ul>
      </div>
      <div className={style.auth} ref={dropdownRef}>
        <Link to="login">
          <button className={style.login}>Login</button>
        </Link>
        <div
          className={style.registerDropdown}
          onMouseEnter={() => setShowRegisterDropdown(true)}
          onMouseLeave={() => setShowRegisterDropdown(false)}
        >
          <button className={style.signup}>
            Register
            <MdArrowDropDown className={style.dropdownIcon} />
          </button>
          {showRegisterDropdown && (
            <div className={style.dropdown}>
              <Link
                to="/register"
                className={style.dropdownLink}
                onClick={closeDropdowns}
              >
                Individual Registration
              </Link>
              <Link
                to="/company"
                className={style.dropdownLink}
                onClick={closeDropdowns}
              >
                Company Registration
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className={style.hamburger} onClick={toggleMenu}>
        {isOpen ? <AiOutlineClose size={25} /> : <FaBars size={25} />}
      </div>
    </nav>
  );
};

export default Navigation;