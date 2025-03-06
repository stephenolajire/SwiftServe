import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { MdArrowDropDown } from "react-icons/md";
import logo from "../assets/logoo.jpeg";
import styles from "../css/Navigation.module.css";
import { GlobalContext } from "../constant/GlobalContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { isAuthenticated } = useContext(GlobalContext);

  const navigate = useNavigate();

  const handleNavToRegister = () => {
    navigate("/register");
  };

  const handleNavToCompany = () => {
    navigate("/company");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeAll = () => {
    setIsOpen(false);
    setShowRegisterDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRegisterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <img src={logo} alt="logo" />
      </div>

      <div className={`${styles.links} ${isOpen ? styles.active : ""}`}>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
              onClick={closeAll}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="about"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
              onClick={closeAll}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="courier"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
              onClick={closeAll}
            >
              Become a courier
            </NavLink>
          </li>
          <li>
            <NavLink
              to="contact"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
              onClick={closeAll}
            >
              Contact us
            </NavLink>
          </li>
          <li>
            <NavLink
              to="listing"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
              onClick={closeAll}
            >
              Items
            </NavLink>
          </li>
          <li>
            <NavLink
              to="dashboard"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
              onClick={closeAll}
            >
              Dashboard
            </NavLink>
          </li>

          {/* Mobile auth links */}
          {isAuthenticated ? (
            <li className={styles.authLinks}>
              <NavLink
                to="login"
                className={({ isActive }) =>
                  isActive ? styles.activeLink : styles.link
                }
                onClick={closeAll}
              >
                Logout
              </NavLink>
            </li>
          ) : (
            <>
              <li className={styles.authLinks}>
                <NavLink
                  to="login"
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : styles.link
                  }
                  onClick={closeAll}
                >
                  Login
                </NavLink>
              </li>
              <li className={styles.authLinks}>
                <NavLink
                  to="register"
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : styles.link
                  }
                  onClick={closeAll}
                >
                  Individual Registration
                </NavLink>
              </li>
              <li className={styles.authLinks}>
                <NavLink
                  to="company"
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : styles.link
                  }
                  onClick={closeAll}
                >
                  Company Registration
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Desktop auth buttons */}
      <div className={styles.auth} ref={dropdownRef}>
        <Link to="login">
          <button className={styles.login}>Login</button>
        </Link>
        <div
          className={styles.registerDropdown}
          onMouseEnter={() => setShowRegisterDropdown(true)}
          onMouseLeave={() => setShowRegisterDropdown(false)}
        >
          <button className={styles.signup}>
            Register
            <MdArrowDropDown className={styles.dropdownIcon} />
          </button>
          {showRegisterDropdown && (
            <div className={styles.dropdown}>
              <Link
                to="/register"
                className={styles.dropdownLink}
                onClick={closeAll}
              >
                Individual Registration
              </Link>
              <Link
                to="/company"
                className={styles.dropdownLink}
                onClick={closeAll}
              >
                Company Registration
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className={styles.hamburger} onClick={toggleMenu}>
        {isOpen ? (
          <AiOutlineClose className={styles.icon} size={25} />
        ) : (
          <FaBars size={25} />
        )}
      </div>
    </nav>
  );
};

export default Navigation;
