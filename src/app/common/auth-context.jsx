// src/common/auth-context.js
"use client";
import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [stdAccessToken, setStdAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentInfo, setStudentInfo] = useState({});
  const [student_id, setStudent_id] = useState(null);

  const router = useRouter();

  // admin login and logout
  const login = (token) => {
    setAccessToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setStdAccessToken(null);
    setIsAuthenticated(false);
  };

  // student login and logout
  const stdLogin = (token) => {
    setStdAccessToken(token);
    setIsAuthenticated(true);
  };

  const stdLogout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  // get admin access token
  const getAccessToken = async () => {
    try {
      const response = await axios.get("/api/get-access-token", {
        withCredentials: true,
      });

      if (response.data && response.data.accessToken) {
        login(response.data.accessToken);
        return response.data.accessToken;
      } else {
        // If accessToken is not found, run refreshToken
        return await refreshToken();
      }
    } catch (error) {
      console.error("Error getting access token:", error);
      // If there's an error in response, run refreshToken
      return await refreshToken();
    }
  };
  // get student access token from cookies
  const getStdAccessToken = async () => {
    try {
      const response = await axios.get("/api/student/get-access-token", {
        withCredentials: true,
      });

      if (response.data && response.data.stdAccessToken) {
        stdLogin(response.data.stdAccessToken);
        return response.data.stdAccessToken;
      } else {
        // If accessToken is not found, run refreshToken
        return await refreshStdToken();
      }
    } catch (error) {
      console.error("Error getting access token:", error);
      // If there's an error in response, run refreshToken
      return await refreshStdToken();
    }
  };

  // function to refresh admin access token
  const refreshToken = async () => {
    try {
      const response = await axios.get("/api/refresh-token", {
        withCredentials: true,
      });

      const newAccessToken = response.data.data.accessToken;
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      logout();
      return null;
    }
  };

  // function to refresh admin access token
  const refreshStdToken = async () => {
    try {
      const response = await axios.get("/api/student/refresh-token", {
        withCredentials: true,
      });
      const newAccessToken = response.data.data.stdAccessToken;
      setStdAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      logout();
      return null;
    }
  };

  //admin logout function
  const handleLogout = async () => {
    try {
      const response = await axios.get("/api/logout", {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Successfully logged out
        console.log("Logout successful");
        // Optionally, clear user-related data from state or context here
        setAccessToken(null);
        // Redirect to the login page or home page
        router.push("/admin/login"); // Adjust this path based on your application structure
        setAccessToken(null);
      } else {
        // Handle error response
        const errorData = await response.json();
        console.error("Logout error:", errorData.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  //studen logout function
  const handleStdLogout = async () => {
    try {
      const response = await axios.get("/api/student/logout", {
        withCredentials: true,
      });

      if (response.status === 200) {
        // Successfully logged out
        console.log("Logout successful");
        // Optionally, clear user-related data from state or context here
        setStdAccessToken(null);
        // Redirect to the login page or home page
        router.push("/student/login"); // Adjust this path based on your application structure
        setStdAccessToken(null);
      } else {
        // Handle error response
        const errorData = await response.json();
        console.error("Logout error:", errorData.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // get admin info
  const getAdminData = async () => {
    const response = await axios.get("/api/admin-info", {
      withCredentials: true,
    });
    console.log("admin response is", response);

    return response;
  };

  // get student info
  const getStudentData = async () => {
    const response = await axios.get("/api/admin-info", {
      withCredentials: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        getAdminData,
        getStudentData,
        handleLogout,
        handleStdLogout,
        accessToken,
        stdAccessToken,
        setStdAccessToken,
        setAccessToken,
        isAuthenticated,
        stdLogin,
        login,
        stdLogout,
        logout,
        refreshToken,
        refreshStdToken,
        getStdAccessToken,
        getAccessToken,
        studentInfo,
        setStudentInfo,
        student_id,
        setStudent_id,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
