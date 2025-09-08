// import React from "react";
// import { projects } from "../utils/dummyData";
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// const chartData = [
//   { name:"Jan", credits: 200 },
//   { name:"Feb", credits: 400 },
//   { name:"Mar", credits: 800 },
//   { name:"Apr", credits: 1000 }
// ];

// export default function TransparencyDashboard(){
//   const total = projects.reduce((s,p)=>s+p.credits,0);
//   return (
//     <div className="grid md:grid-cols-2 gap-6">
//       <div className="bg-white p-4 rounded shadow">
//         <h3 className="font-semibold">Public Transparency Dashboard</h3>
//         <p className="text-4xl font-bold mt-3">{total}</p>
//         <p className="text-sm text-gray-500">Total Credits Issued</p>

//         <div className="mt-6 w-full" style={{height:220}}>
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={chartData}>
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Area type="monotone" dataKey="credits" stroke="#1f6feb" fill="#cfe9ff" />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="bg-white p-4 rounded shadow">
//         <h3 className="font-semibold">Recent Public Activity</h3>
//         <ul className="mt-4 space-y-3">
//           {projects.map(p => (
//             <li key={p.id} className="flex justify-between items-center">
//               <div>
//                 <div className="font-medium">{p.title}</div>
//                 <div className="text-xs text-gray-500">{p.region} • {p.date}</div>
//               </div>
//               <div className="text-sm">{p.credits} cr.</div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   )
// }
import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function TransparencyDashboard() {
  // Example chart data
  const data = [
    { name: "Approved", value: 10 },
    { name: "Pending", value: 5 },
    { name: "Rejected", value: 3 },
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent"
      >
        📊 Transparency Dashboard
      </motion.h1>

      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center border"
        >
          <h3 className="text-lg font-semibold text-gray-700">Total Credits</h3>
          <p className="text-3xl font-bold text-indigo-600">125</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center border"
        >
          <h3 className="text-lg font-semibold text-gray-700">Projects</h3>
          <p className="text-3xl font-bold text-green-600">18</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center border"
        >
          <h3 className="text-lg font-semibold text-gray-700">Communities</h3>
          <p className="text-3xl font-bold text-pink-600">6</p>
        </motion.div>
      </div>

      {/* Chart Section */}
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Status Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
