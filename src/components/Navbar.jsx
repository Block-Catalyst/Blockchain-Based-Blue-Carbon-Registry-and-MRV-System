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
    `relative font-semibold px-3 py-2 transition duration-300 
     ${
       isActive
         ? "text-indigo-600"
         : "text-gray-800 hover:text-emerald-600"
     }
     after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 
     after:bg-gradient-to-r after:from-indigo-500 via-teal-500 to-emerald-500 after:rounded-full
     hover:after:w-full after:transition-all after:duration-500`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-emerald-50 via-sky-50 to-indigo-50 border-b border-emerald-200 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Brand */}
        <Link
          to="/"
          className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-emerald-600 to-sky-700 bg-clip-text text-transparent tracking-tight hover:scale-105 transition-transform"
        >
          Blue Carbon
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="text-3xl text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <FaUserCircle />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-indigo-200 rounded-2xl shadow-xl p-4 animate-fadeIn">
                  <p className="font-bold text-gray-800">{user.email}</p>
                  {user.role === "admin" ? (
                    <p className="text-sm text-gray-600 mt-1">Username: Admin</p>
                  ) : (
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Project: {user.project}</p>
                      <p>Credits: {user.credits}</p>
                      <p>Area: {user.area} ha</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setUser(null);
                      setProfileOpen(false);
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-indigo-600"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gradient-to-r from-emerald-50 via-sky-50 to-indigo-50 backdrop-blur-lg border-t border-emerald-200 px-6 shadow-lg"
          >
            <div className="flex flex-col py-4 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-medium ${
                      isActive ? "text-indigo-600" : "text-gray-700 hover:text-emerald-600"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
