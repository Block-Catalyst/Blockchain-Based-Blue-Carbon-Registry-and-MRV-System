import React, { useState, createContext, useContext } from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Error: {this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Auth Context (Simple implementation)
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Navigation Component
const Navigate = ({ to, replace = false }) => {
  const { setCurrentRoute } = useRouter();
  
  React.useEffect(() => {
    setCurrentRoute(to);
  }, [to, setCurrentRoute]);

  return null;
};

// Simple Router Context
const RouterContext = createContext();

const RouterProvider = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState('/login');

  const value = {
    currentRoute,
    setCurrentRoute
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

// Test/Fallback Component
const TestComponent = ({ title }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">This page is working correctly!</p>
      <RouteButton to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">
        Go to Login
      </RouteButton>
      <RouteButton to="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Go to Register
      </RouteButton>
    </div>
  </div>
);

// Route Button Component
const RouteButton = ({ to, children, className = "" }) => {
  const { setCurrentRoute } = useRouter();
  
  return (
    <button 
      onClick={() => setCurrentRoute(to)}
      className={className}
    >
      {children}
    </button>
  );
};

// Login Component (Demo)
const Login = () => {
  const { login } = useAuth();
  const { setCurrentRoute } = useRouter();
  const [formData, setFormData] = useState({
    role: "field",
    email: "",
    password: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Demo authentication
    if (formData.role === "admin" && formData.email === "admin@example.com" && formData.password === "admin123") {
      login({ role: "admin", email: formData.email, username: "Admin" });
      setCurrentRoute("/admin");
    } else if (formData.role === "field" && formData.email === "user@example.com" && formData.password === "user123") {
      login({ role: "field", email: formData.email, project: "Mangrove Restoration A" });
      setCurrentRoute("/field-portal");
    } else {
      alert("Invalid credentials! Use admin@example.com/admin123 or user@example.com/user123");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="field">Field User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="Enter your email"
            />
            <p className="text-xs text-gray-500 mt-1">
              Demo: {formData.role === "admin" ? "admin@example.com" : "user@example.com"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              placeholder="Enter your password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Demo: {formData.role === "admin" ? "admin123" : "user123"}
            </p>
          </div>

          {formData.role === "field" && (
            <div className="text-sm text-center text-gray-600">
              <p>
                New User?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentRoute("/register")}
                  className="text-blue-600 font-semibold hover:underline focus:outline-none"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

// Register Component (Full Implementation)
const Register = () => {
  const { setCurrentRoute } = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    phone: "",
    location: "",
    role: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
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
    }

    // Role validation
    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Store user data (in memory for this demo)
      console.log("Registration data:", formData);
      setIsSubmitted(true);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          organization: "",
          phone: "",
          location: "",
          role: ""
        });
        setIsSubmitted(false);
      }, 3000);
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
            <p className="text-gray-600 mb-4">Please login with your credentials to continue.</p>
            <button
              onClick={() => setCurrentRoute('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Field User Registration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input 
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Enter your full name" 
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Enter your email" 
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Enter phone number" 
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Enter password" 
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Confirm Password</label>
            <input 
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Confirm password" 
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Organization */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700">Organization / NGO / Community</label>
            <input 
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Enter organization name" 
            />
            {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Location (District / State)</label>
            <input 
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Enter location" 
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Your Role</label>
            <input 
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="e.g. Community Leader, NGO Officer" 
            />
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          {/* Submit Button */}
          <div className="col-span-2">
            <button 
              type="submit" 
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              Register
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account? 
            <button
              onClick={() => setCurrentRoute('/login')}
              className="text-blue-600 font-medium cursor-pointer hover:underline ml-1"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Unauthorized Component
const Unauthorized = () => {
  const { setCurrentRoute } = useRouter();
  const { logout } = useAuth();

  const handleLogin = () => {
    logout();
    setCurrentRoute('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource.
        </p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Login Again
        </button>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => (
  <TestComponent title="Admin Dashboard - Access Granted!" />
);

// Field Portal
const FieldPortal = () => (
  <TestComponent title="Field Portal - Welcome Field User!" />
);

// Route Component
const Route = ({ path, element }) => {
  const { currentRoute } = useRouter();
  
  if (currentRoute === path) {
    return element;
  }
  
  return null;
};

// Routes Component
const Routes = ({ children }) => {
  const { currentRoute } = useRouter();
  
  // Find matching route
  const routes = React.Children.toArray(children);
  const matchedRoute = routes.find(route => 
    route.props.path === currentRoute || 
    (route.props.path === "*" && !routes.some(r => r.props.path === currentRoute))
  );
  
  return matchedRoute || routes.find(route => route.props.path === "/") || null;
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <RouterProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <ErrorBoundary>
                  <Login />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ErrorBoundary>
                  <Register />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/unauthorized" 
              element={
                <ErrorBoundary>
                  <Unauthorized />
                </ErrorBoundary>
              } 
            />

            {/* Protected routes */}
            <Route 
              path="/admin" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/field-portal" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute requiredRole="field">
                    <FieldPortal />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />

            {/* Test route for debugging */}
            <Route 
              path="/test" 
              element={<TestComponent title="Test Page - Routing Works!" />} 
            />

            {/* Default route */}
            <Route path="*" element={<Login />} />
          </Routes>
        </AuthProvider>
      </RouterProvider>
    </ErrorBoundary>
  );
}

export default App;