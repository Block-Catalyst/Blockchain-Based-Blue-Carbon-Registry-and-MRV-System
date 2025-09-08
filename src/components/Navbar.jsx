// import React from "react";
// import { Link, useLocation } from "react-router-dom";

// export default function Navbar(){
//   const loc = useLocation();
//   return (
//     <header className="bg-white shadow-sm">
//       <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
//         <Link to="/" className="flex items-center space-x-3">
//           <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded flex items-center justify-center text-white font-bold">BC</div>
//           <div>
//             <div className="text-lg font-semibold">Blue Carbon Registry</div>
//             <div className="text-xs text-gray-500">Transparent MRV for coastal restoration</div>
//           </div>
//         </Link>

//         <nav className="space-x-3 text-sm">
//           <Link className={`px-3 py-2 rounded ${loc.pathname === "/" ? "bg-panel" : "hover:bg-gray-100"}`} to="/">Home</Link>
//           <Link className={`px-3 py-2 rounded ${loc.pathname === "/dashboard" ? "bg-panel" : "hover:bg-gray-100"}`} to="/dashboard">Transparency</Link>
//           <Link className={`px-3 py-2 rounded ${loc.pathname === "/field-portal" ? "bg-panel" : "hover:bg-gray-100"}`} to="/field-portal">Field Portal</Link>
//           <Link className={`px-3 py-2 rounded ${loc.pathname === "/admin" ? "bg-panel" : "hover:bg-gray-100"}`} to="/admin">Admin</Link>
//           <Link className="px-3 py-2 rounded bg-primary text-white" to="/login">Login</Link>
//         </nav>
//       </div>
//     </header>
//   )
// }
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/field-portal", label: "Field Portal" },
    { path: "/admin", label: "Admin Panel" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/login", label: "Login" },
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
        <div className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? (
            // X icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            // Hamburger icon
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
