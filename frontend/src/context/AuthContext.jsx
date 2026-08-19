import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = (themeValue) => {
    let mode = themeValue || 'dark';
    if (mode === 'system') {
       mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (mode === 'dark') {
       document.documentElement.classList.add('dark');
    } else {
       document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('http://localhost:5000/api/users/profile');
          setUser(res.data);
          applyTheme(res.data.theme);
        } catch (err) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    applyTheme(res.data.user.theme);
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const googleLogin = async (token) => {
    const res = await axios.post('http://localhost:5000/api/auth/google', { token });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    applyTheme(res.data.user.theme);
    return res.data;
  };

  const updateThemeSync = (themeValue) => {
     setUser(prev => ({...prev, theme: themeValue}));
     applyTheme(themeValue);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateThemeSync, googleLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
