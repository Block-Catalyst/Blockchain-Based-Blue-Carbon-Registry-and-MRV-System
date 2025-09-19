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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
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
          await verifyToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
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
        setUser(prevUser => ({ ...prevUser, ...response.data.data.user }));
        return true;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token is invalid, logout user
      logout();
      return false;
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
      const errorMessage = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors || [];
      
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
      const errorMessage = error.response?.data?.message || 'Login failed';
      const errors = error.response?.data?.errors || [];
      
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
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      const errors = error.response?.data?.errors || [];
      
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
      const errorMessage = error.response?.data?.message || 'Password change failed';
      const errors = error.response?.data?.errors || [];
      
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
      const errorMessage = error.response?.data?.message || 'Password reset request failed';
      
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
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      
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