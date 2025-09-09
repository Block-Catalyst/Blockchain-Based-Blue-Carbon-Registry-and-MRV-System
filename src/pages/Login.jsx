import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  role: yup.string().required("Please select your role"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
}).required();

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: "field", email: "" }
  });

  const navigate = useNavigate();

  const onSubmit = (data) => {
    localStorage.setItem("role", data.role);
    localStorage.setItem("email", data.email);

    if (data.role === "admin") {
      navigate("/admin");
    } else if (data.role === "field") {
      navigate("/field-portal");
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

          {/* ✅ Button Always Visible */}
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
