import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

// Validation Schema
const schema = yup.object({
  role: yup.string().required("Please select your role"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(4, "Password must be at least 4 characters").required("Password is required"),
}).required();

export default function Login({ setUser }) {   // ✅ accept setUser from App.jsx
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: "field", email: "", password: "" }
  });

  const navigate = useNavigate();
  const role = watch("role");

  const onSubmit = (data) => {
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));

    if (role === "admin") {
      if (data.email === "admin@example.com" && data.password === "admin123") {
        navigate("/admin");
      } else {
        alert("Invalid admin credentials!");
      }
    } else if (role === "field") {
      if (
        storedUser &&
        storedUser.email === data.email &&
        storedUser.password === data.password
      ) {
        // ✅ Save logged-in user globally (Navbar will use this)
        setUser({
          email: data.email,
          project: "Mangrove Restoration A",   // dummy project for now
          credits: 1200,                       // dummy credits
          area: 50                             // dummy area
        });

        localStorage.setItem("role", "field");
        localStorage.setItem("email", data.email);

        navigate("/field-portal");
      } else {
        alert("Invalid Field User credentials! Please register first.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Login</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Role</label>
            <select {...register("role")} className="w-full border rounded-lg p-2">
              <option value="field">Field User</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-red-500 text-xs mt-1">{errors.role?.message}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              {...register("email")} 
              className="w-full border rounded-lg p-2" 
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password"
              {...register("password")} 
              className="w-full border rounded-lg p-2" 
              placeholder="Enter your password"
            />
            <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>
          </div>

          {/* Signup option only for Field Users */}
          {role === "field" && (
            <div className="text-sm text-center">
              <p>
                New User?{" "}
                <button 
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}

          {/* Submit */}
          <div>
            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
