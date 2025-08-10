import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';
import otService from '../api/otService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from sessionStorage lazily to run only once
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));
  const [isAssistant, setIsAssistant] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Memoize the logout function to ensure it has a stable reference
  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAssistant(false);
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true);
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            // Token is valid, set auth headers and user state
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            setUser(currentUser);

            // Check for assistant role only if the user is a standard user
            const isUserRoleOnly = currentUser.roles.includes('ROLE_USER') && !currentUser.roles.includes('ROLE_MANAGER') && !currentUser.roles.includes('ROLE_CAO');
            
            if (isUserRoleOnly) {
              try {
                const checkpointsRes = await otService.getMyCheckpoints();
                setIsAssistant(checkpointsRes.data && checkpointsRes.data.length > 0);
              } catch (err) {
                setIsAssistant(false);
              }
            } else {
              setIsAssistant(false);
            }
          } else {
            // Token expired
            logout();
          }
        } catch (error) {
          // Token invalid
          console.error("Invalid token on initial load:", error);
          logout();
        }
      } else {
        // No token found
        setIsAuthenticated(false);
        setUser(null);
        setIsAssistant(false);
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, [token, logout]); // Effect runs only when token or logout function changes
  
  // Memoize the updateUser function
  const updateUser = useCallback((newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Memoize the login function
  const login = useCallback(async (username, password) => {
    setAuthLoading(true);
    try {
      const response = await apiClient.post('/auth/signin', { username, password });
      const { token: newToken, ...userData } = response.data;
      
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      // Setting the token will trigger the useEffect to handle all other state updates
      setToken(newToken);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      logout();
      setAuthLoading(false); // Ensure loading stops on login failure
      return false;
    }
  }, [logout]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    loading: authLoading,
    isAssistant,
    login,
    logout,
    updateUser
  }), [user, token, isAuthenticated, authLoading, isAssistant, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
