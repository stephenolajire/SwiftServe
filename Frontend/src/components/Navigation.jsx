import React, { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import logo from "../assets/logoo.jpeg";
import styles from "../css/Navigation.module.css";
import { GlobalContext } from "../constant/GlobalContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useContext(GlobalContext);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

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
              onClick={closeMenu}
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
              onClick={closeMenu}
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
              onClick={closeMenu}
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
              onClick={closeMenu}
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
              onClick={closeMenu}
            >
              Items
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
                onClick={closeMenu}
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
                  onClick={closeMenu}
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
                  onClick={closeMenu}
                >
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Desktop auth buttons */}
      <div className={styles.auth}>
        {isAuthenticated ? (
          <Link to="login">
            <button className={styles.login}>Logout</button>
          </Link>
        ) : (
          <>
            <Link to="login">
              <button className={styles.login}>Login</button>
            </Link>
            <Link to="register">
              <button className={styles.signup}>Register</button>
            </Link>
          </>
        )}
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
