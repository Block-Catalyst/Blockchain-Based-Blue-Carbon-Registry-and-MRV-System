import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
export default function Navbar({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/map", label: "Map" },
  ];

  const linkClasses = ({ isActive }) =>
    `relative px-1 py-1 font-medium transition hover:text-green-600
     after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-green-500 after:rounded
     after:w-0 hover:after:w-full
     ${isActive ? "text-green-600 after:w-full" : "text-gray-700"}`;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent"
        >
          🌍 Blue Carbon
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}

          {/* ✅ If user logged in, show profile instead of login */}
          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="text-3xl text-gray-700">
                <FaUserCircle />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-4">
                  <p className="font-bold">{user.email}</p>
                  <p className="text-sm text-gray-600">Project: {user.project}</p>
                  <p className="text-sm text-gray-600">Credits: {user.credits}</p>
                  <p className="text-sm text-gray-600">Area: {user.area} ha</p>
                  <button
                    onClick={() => {
                      setUser(null);
                      setProfileOpen(false);
                    }}
                    className="mt-3 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className={linkClasses}>
              Login
            </NavLink>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-md px-6 overflow-hidden"
          >
            <div className="flex flex-col py-4 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-medium ${isActive ? "text-green-600" : "text-gray-700"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Mobile Profile/Login */}
              {user ? (
                <div className="mt-4 border-t pt-4">
                  <p className="font-bold">{user.email}</p>
                  <p className="text-sm text-gray-600">Project: {user.project}</p>
                  <p className="text-sm text-gray-600">Credits: {user.credits}</p>
                  <p className="text-sm text-gray-600">Area: {user.area} ha</p>
                  <button
                    onClick={() => {
                      setUser(null);
                      setOpen(false);
                    }}
                    className="mt-3 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink to="/login" onClick={() => setOpen(false)} className="font-medium text-gray-700">
                  Login
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
