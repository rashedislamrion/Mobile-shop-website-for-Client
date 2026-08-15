"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface MockAuthContextType {
  isLoggedIn: boolean;
  customerName: string;
  login: (name: string) => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");

  // Load from local storage for persistence across reloads in mock
  useEffect(() => {
    const saved = localStorage.getItem("mock_auth_logged_in");
    const name = localStorage.getItem("mock_auth_name");
    if (saved === "true" && name) {
      setIsLoggedIn(true);
      setCustomerName(name);
    }
  }, []);

  const login = (name: string) => {
    setIsLoggedIn(true);
    setCustomerName(name);
    localStorage.setItem("mock_auth_logged_in", "true");
    localStorage.setItem("mock_auth_name", name);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCustomerName("");
    localStorage.removeItem("mock_auth_logged_in");
    localStorage.removeItem("mock_auth_name");
  };

  return (
    <MockAuthContext.Provider value={{ isLoggedIn, customerName, login, logout }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth must be used within a MockAuthProvider");
  }
  return context;
}
