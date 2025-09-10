import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match").required("Confirm your password"),
  organization: yup.string().required("Organization / NGO / Community name is required"),
  phone: yup.string().matches(/^[0-9]{10}$/, "Enter valid 10-digit phone number").required("Phone number is required"),
  location: yup.string().required("Location is required"),
  role: yup.string().required("Role is required"),
}).required();

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      organization: "",
      phone: "",
      location: "",
      role: ""
    }
  });

  const navigate = useNavigate();

  const onSubmit = (data) => {
    // Save user details to localStorage (later replace with API)
    localStorage.setItem("registeredUser", JSON.stringify(data));
    alert("Registration successful! Please login now.");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Field User Registration</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input {...register("fullName")} className="w-full border rounded-lg p-2" placeholder="Enter your full name" />
            <p className="text-red-500 text-xs">{errors.fullName?.message}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input {...register("email")} className="w-full border rounded-lg p-2" placeholder="Enter your email" />
            <p className="text-red-500 text-xs">{errors.email?.message}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input {...register("phone")} className="w-full border rounded-lg p-2" placeholder="Enter phone number" />
            <p className="text-red-500 text-xs">{errors.phone?.message}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" {...register("password")} className="w-full border rounded-lg p-2" placeholder="Enter password" />
            <p className="text-red-500 text-xs">{errors.password?.message}</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input type="password" {...register("confirmPassword")} className="w-full border rounded-lg p-2" placeholder="Confirm password" />
            <p className="text-red-500 text-xs">{errors.confirmPassword?.message}</p>
          </div>

          {/* Organization */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Organization / NGO / Community</label>
            <input {...register("organization")} className="w-full border rounded-lg p-2" placeholder="Enter organization name" />
            <p className="text-red-500 text-xs">{errors.organization?.message}</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location (District / State)</label>
            <input {...register("location")} className="w-full border rounded-lg p-2" placeholder="Enter location" />
            <p className="text-red-500 text-xs">{errors.location?.message}</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1">Your Role</label>
            <input {...register("role")} className="w-full border rounded-lg p-2" placeholder="e.g. Community Leader, NGO Officer" />
            <p className="text-red-500 text-xs">{errors.role?.message}</p>
          </div>

          {/* Submit Button */}
          <div className="col-span-2">
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
