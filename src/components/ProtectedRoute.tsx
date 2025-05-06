// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
