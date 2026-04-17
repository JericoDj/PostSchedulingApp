import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }


  return 'https://scheduling-api-xi.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = 'token';
const USER_KEY = 'auth_user';

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message;
    }
  } catch (_) {
    // Ignore parse issues and return fallback.
  }

  return fallbackMessage;
};

const saveAuthState = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthState = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (_) {
          localStorage.removeItem(USER_KEY);
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearAuthState();
          setUser(null);
          setLoading(false);
          return;
        }

        const me = await response.json();
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
      } catch (_) {
        // Keep cached user on temporary network failures.
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const LoginRoute = `${API_BASE_URL}/api/auth/login`;
    console.log("Login attempt");
    console.log(API_BASE_URL);
    console.log(email);
    console.log(password);

    const response = await fetch(LoginRoute, {
      method: 'POST',
      credentials: 'include', // 🔥 THIS IS THE FIX
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("getting here");

    if (!response.ok) {
      console.log("Login failed");
      console.log(response);
      throw new Error(await getErrorMessage(response, 'Login failed'));
    }

    const data = await response.json();
    saveAuthState(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password, avatar_url }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, avatar_url }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Registration failed'));
    }

    const data = await response.json();
    saveAuthState(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const getMe = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to load current user'));
    }

    const me = await response.json();
    setUser(me);
    localStorage.setItem(USER_KEY, JSON.stringify(me));
    return me;
  };

  const loginWithFacebook = async (accessToken, userID) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/facebook/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, userID }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Facebook login failed'));
    }

    const data = await response.json();
    saveAuthState(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const forgotPassword = async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Forgot password request failed'));
    }

    const data = await response.json();
    return data.message || 'Reset instructions sent';
  };

  const logout = () => {
    clearAuthState();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, forgotPassword, loginWithFacebook, getMe, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
