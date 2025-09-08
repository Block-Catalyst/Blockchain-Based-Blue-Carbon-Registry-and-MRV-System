// // import React from "react";
// // import { motion } from "framer-motion";
// // import { Link } from "react-router-dom";

// // export default function Home(){
// //   return (
// //     <div className="grid md:grid-cols-2 gap-6 items-center">
// //       <div>
// //         <motion.h1 initial={{opacity:0, x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.1}} className="text-3xl md:text-4xl font-bold">
// //           Blue Carbon Registry — Transparent MRV for coastal restoration
// //         </motion.h1>
// //         <motion.p initial={{opacity:0, x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.2}} className="mt-4 text-gray-600">
// //           Immutable proof, tokenized credits, and direct benefits to communities. Demo-ready interface for field users, verifiers, and public transparency.
// //         </motion.p>

// //         <div className="mt-6 flex gap-3">
// //           <Link to="/field-portal" className="px-5 py-2 bg-accent text-white rounded shadow">Field Portal</Link>
// //           <Link to="/admin" className="px-5 py-2 border rounded">Admin Panel</Link>
// //           <Link to="/dashboard" className="px-5 py-2 border rounded">Transparency</Link>
// //         </div>

// //         <div className="mt-6 text-sm text-gray-500">
// //           Tip: use the Field Portal to submit a mock project (image + GPS). Admin can approve so credits appear on Transparency page.
// //         </div>
// //       </div>

// //       <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white p-6 rounded shadow">
// //         <h4 className="font-semibold mb-2">How it works (analogy)</h4>
// //         <ol className="list-decimal pl-5 text-gray-600">
// //           <li>Community plants mangroves & uploads photos + GPS via Field Portal.</li>
// //           <li>Verifier/Admin approves → tokenized credits are recorded (demo: simulated).</li>
// //           <li>Payment triggered off-chain and split among stakeholders (simulated dashboard).</li>
// //         </ol>
// //       </motion.div>
// //     </div>
// //   )
// // }

// import React from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

// export default function Home() {
//   return (
//     <div className="grid md:grid-cols-2 gap-6 items-center">
//       {/* Left Section */}
//       <div>
//         <motion.h1
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.1 }}
//           className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent"
//         >
//           Blue Carbon Registry — Transparent MRV for coastal restoration
//         </motion.h1>

//         <motion.p
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.2 }}
//           className="mt-4 text-lg text-gray-700 leading-relaxed"
//         >
//           Immutable proof, tokenized credits, and direct benefits to communities. Demo-ready
//           interface for field users, verifiers, and public transparency.
//         </motion.p>

//         {/* Buttons */}
//         <div className="mt-6 flex gap-3">
//           <Link
//             to="/field-portal"
//             className="px-5 py-2 rounded-xl bg-accent text-white shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
//           >
//             Field Portal
//           </Link>
//           <Link
//             to="/admin"
//             className="px-5 py-2 rounded-xl border border-gray-300 bg-white/50 hover:bg-white hover:shadow-md transition"
//           >
//             Admin Panel
//           </Link>
//           <Link
//             to="/dashboard"
//             className="px-5 py-2 rounded-xl border border-gray-300 bg-white/50 hover:bg-white hover:shadow-md transition"
//           >
//             Transparency
//           </Link>
//         </div>

//         {/* Tip Section */}
//         <div className="mt-6 text-sm text-gray-500 italic">
//           💡 Tip: Use the Field Portal to submit a mock project (image + GPS). Admin can approve so
//           credits appear on Transparency page.
//         </div>
//       </div>

//       {/* Right Section (Card) */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition"
//       >
//         <h4 className="font-semibold text-lg mb-3 text-gray-800">How it works (analogy)</h4>
//         <ol className="list-decimal pl-5 text-gray-700 space-y-2">
//           <li>🌱 Community plants mangroves & uploads photos + GPS via Field Portal.</li>
//           <li>✅ Verifier/Admin approves → tokenized credits are recorded (demo: simulated).</li>
//           <li>💰 Payment triggered off-chain and split among stakeholders (simulated dashboard).</li>
//         </ol>
//       </motion.div>
//     </div>
//   );
// }
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center min-h-[80vh]">
      {/* Left side */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
        >
          Blue Carbon Registry — Transparent MRV for Coastal Restoration
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-5 text-lg text-gray-600 leading-relaxed"
        >
          Immutable proof, tokenized credits, and direct benefits to communities.  
          Demo-ready interface for field users, verifiers, and public transparency.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link
            to="/field-portal"
            className="px-6 py-2.5 rounded-lg bg-green-500 text-white font-medium shadow-md hover:bg-green-600 transition"
          >
            Field Portal
          </Link>
          <Link
            to="/admin"
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white/70 backdrop-blur-md shadow hover:border-green-400 hover:text-green-600 transition"
          >
            Admin Panel
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white/70 backdrop-blur-md shadow hover:border-blue-400 hover:text-blue-600 transition"
          >
            Transparency
          </Link>
        </motion.div>

        <p className="mt-6 text-sm text-gray-500">
          💡 Tip: Use the Field Portal to submit a mock project (image + GPS).  
          Admin can approve so credits appear on Transparency page.
        </p>
      </div>

      {/* Right side card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border"
      >
        <h4 className="font-bold text-lg text-gray-800 mb-4">
          ⚡ How it works
        </h4>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>
            Community plants mangroves & uploads photos + GPS via Field Portal.
          </li>
          <li>
            Verifier/Admin approves → tokenized credits are recorded (demo: simulated).
          </li>
          <li>
            Payment triggered off-chain and split among stakeholders (simulated dashboard).
          </li>
        </ol>
      </motion.div>
    </div>
  );
}
