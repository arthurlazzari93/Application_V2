// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
// Layouts
import AdminLayout from "layouts/Admin.jsx";
import AuthLayout from "layouts/Auth.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para /admin/... */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Rota para /auth/... */}
        <Route path="/auth/*" element={<AuthLayout />} />

        {/* Se quiser rota para / (homepage) */}
        {/* <Route path="/" element={<LandingPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
