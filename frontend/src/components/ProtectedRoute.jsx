// src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return false;
  }
};

const ProtectedRoute = () => {
  const token = localStorage.getItem("access_token");
  const isAuthenticated = isTokenValid(token);

  // Se autenticado, renderiza o Outlet (filhos).
  // Caso contrário, redireciona para /auth/login
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
