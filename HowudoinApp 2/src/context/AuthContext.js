import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded.id,
        username: decoded.sub
      };
    } catch (error) {
      console.error('Token decode hatası:', error);
      return null;
    }
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
          const decodedUserData = decodeToken(token);
          setUserData(decodedUserData);
        }
      } catch (e) {
        console.error('Token control error:', e);
      }
    };
    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.0.109:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      if (data.token) {
        setUserToken(data.token);
        const decodedUserData = decodeToken(data.token);
        setUserData(decodedUserData);
        await AsyncStorage.setItem('userToken', data.token);
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUserToken(null);
      setUserData(null);
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      login,
      logout,
      isLoading,
      userToken,
      userData
    }}>
      {children}
    </AuthContext.Provider>
  );
};