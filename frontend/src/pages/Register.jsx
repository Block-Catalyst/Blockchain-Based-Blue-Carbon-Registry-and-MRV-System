import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    phone: "",
    location: "",
    userRole: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/field-portal');
      }
    }
  }, [isAuthenticated, navigate]);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full Name must be at least 2 characters";
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = "Full Name cannot exceed 100 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords must match";
    }

    // Organization validation
    if (!formData.organization.trim()) {
      newErrors.organization = "Organization / NGO / Community name is required";
    } else if (formData.organization.trim().length > 200) {
      newErrors.organization = "Organization name cannot exceed 200 characters";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    } else if (formData.location.trim().length > 200) {
      newErrors.location = "Location cannot exceed 200 characters";
    }

    // Role validation
    if (!formData.userRole.trim()) {
      newErrors.userRole = "Role is required";
    } else if (formData.userRole.trim().length > 100) {
      newErrors.userRole = "Role cannot exceed 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      
      const result = await register(registrationData);
      
      if (result.success) {
        setIsSubmitted(true);
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          organization: "",
          phone: "",
          location: "",
          userRole: ""
        });
        
        // Redirect to login with success message
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login with your credentials.' 
            }
          });
        }, 3000);
        
      } else {
        // Handle registration errors from backend
        if (result.errors && result.errors.length > 0) {
          const formErrors = {};
          result.errors.forEach(err => {
            const field = err.path || err.field || err.param || 'general';
            formErrors[field] = err.msg || err.message;
          });
          setErrors(formErrors);
        } else if (result.message) {
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: "An unexpected error occurred. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Field User Registration</h2>
        
        {/* Display auth error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error.message}</p>
            {error.errors && error.errors.length > 0 && (
              <ul className="mt-1 text-red-600 text-xs list-disc list-inside">
                {error.errors.map((err, index) => (
                  <li key={index}>{err.message || err.msg}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* General form errors */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Full Name*</label>
              <input 
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter your full name"
                disabled={loading || isSubmitting}
                maxLength={100}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email*</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter your email"
                disabled={loading || isSubmitting}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number*</label>
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter 10-digit phone number"
                disabled={loading || isSubmitting}
                maxLength={10}
                pattern="[0-9]{10}"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password*</label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter password (min. 6 characters)"
                disabled={loading || isSubmitting}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Confirm Password*</label>
              <input 
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Confirm password"
                disabled={loading || isSubmitting}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Organization */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Organization / NGO / Community*</label>
              <input 
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter organization name"
                disabled={loading || isSubmitting}
                maxLength={200}
              />
              {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Location (District / State)*</label>
              <input 
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Enter location"
                disabled={loading || isSubmitting}
                maxLength={200}
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Your Role*</label>
              <input 
                type="text"
                name="userRole"
                value={formData.userRole}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="e.g. Community Leader, NGO Officer"
                disabled={loading || isSubmitting}
                maxLength={100}
              />
              {errors.userRole && <p className="text-red-500 text-xs mt-1">{errors.userRole}</p>}
            </div>

            {/* Submit Button */}
            <div className="col-span-2">
              <button 
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account? 
            <Link
              to="/login"
              className="text-blue-600 font-medium cursor-pointer hover:underline ml-1"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}