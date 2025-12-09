// App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout";
import Dashboard from "./pages/Dashboard";
import DataGudang from "./pages/DataGudang";
import DataBarang from "./pages/DataBarang";
import DataKurir from "./pages/DataKurir";
import DataPengiriman from "./pages/DataPengiriman";
import DataEkspedisi from "./pages/DataEkspedisi";
import Laporan from "./pages/Laporan";

// Auth
import Login from "./auth/Login";
import Register from "./auth/Register";
import { useAuth } from "./hooks/useAuth";

import Unauthorized from "./pages/Unauthorized";
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  try {
    return <Layout>{children}</Layout>;
  } catch (error) {
    console.error("Error rendering Layout:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading page</p>
          <p className="text-red-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages (Tanpa Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Pages (Admin only) */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "dispatcher", "petugas_gudang"]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gudang"
          element={
            <ProtectedRoute allowedRoles={["admin", "petugas_gudang"]}>
              <DataGudang />
            </ProtectedRoute>
          }
        />

        <Route
          path="/barang"
          element={
            <ProtectedRoute allowedRoles={["admin", "petugas_gudang"]}>
              <DataBarang />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kurir"
          element={
            <ProtectedRoute allowedRoles={["admin", "dispatcher"]}>
              <DataKurir />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengiriman"
          element={
            <ProtectedRoute allowedRoles={["admin", "dispatcher"]}>
              <DataPengiriman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ekspedisi"
          element={
            <ProtectedRoute allowedRoles={["admin", "dispatcher"]}>
              <DataEkspedisi />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan"
          element={
            <ProtectedRoute allowedRoles={["admin", "dispatcher"]}>
              <Laporan />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
