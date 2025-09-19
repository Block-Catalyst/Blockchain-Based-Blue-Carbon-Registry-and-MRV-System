import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session management
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and other errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Check if it's not a login attempt
      if (!error.config.url?.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
    }
    
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          
          // Verify token with backend
          try {
            await verifyToken(storedToken);
          } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            // Clear invalid token
            logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Verify token with backend
  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      });

      if (response.data.success) {
        // Token is valid, update user data if needed
        const userData = response.data.data.user;
        setUser(prevUser => ({ ...prevUser, ...userData }));
        
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        const { user: newUser, token: newToken } = response.data.data;
        
        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Update state
        setUser(newUser);
        setToken(newToken);

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      let errors = [];

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errors = error.response.data.errors || [];
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError({ message: errorMessage, errors });
      return { 
        success: false, 
        message: errorMessage,
        errors 
      };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/login', credentials);

      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setToken(authToken);

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      let errors = [];

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errors = error.response.data.errors || [];
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError({ message: errorMessage, errors });
      return { 
        success: false, 
        message: errorMessage,
        errors 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      // Call logout endpoint if user is authenticated
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear state and localStorage regardless of API call result
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('registeredUser'); // Clean up old localStorage data
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put('/auth/profile', profileData);

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Profile update failed';
      let errors = [];

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errors = error.response.data.errors || [];
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError({ message: errorMessage, errors });
      return { 
        success: false, 
        message: errorMessage,
        errors 
      };
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put('/auth/password', passwordData);

      if (response.data.success) {
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      let errorMessage = 'Password change failed';
      let errors = [];

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errors = error.response.data.errors || [];
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError({ message: errorMessage, errors });
      return { 
        success: false, 
        message: errorMessage,
        errors 
      };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Password reset request failed';

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError({ message: errorMessage });
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (resetToken, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/auth/reset-password/${resetToken}`, {
        password: newPassword
      });

      if (response.data.success) {
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Password reset failed';

      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError({ message: errorMessage });
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Get current user data
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');

      if (response.data.success) {
        const userData = response.data.data.user;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);

        return { success: true, data: userData };
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      // If user fetch fails, probably token is invalid
      logout();
      return { success: false, message: 'Failed to get user data' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    hasRole,
    isAuthenticated,
    verifyToken,
    clearError,
    // Expose axios instance for other components that need to make API calls
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};