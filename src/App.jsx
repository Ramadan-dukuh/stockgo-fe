import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Dashboard from "./pages/Dashboard";
import DataGudang from "./pages/DataGudang";
import DataBarang from "./pages/DataBarang";
import DataKurir from "./pages/DataKurir";
import DataPengiriman from "./pages/DataPengiriman";
import Laporan from "./pages/Laporan";

// Auth
import Login from "./auth/Login";
import Register from "./auth/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages (Tanpa Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages Dalam Layout (Sudah Ada Sidebar) */}
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/gudang"
          element={
            <Layout>
              <DataGudang />
            </Layout>
          }
        />

        <Route
          path="/barang"
          element={
            <Layout>
              <DataBarang />
            </Layout>
          }
        />

        <Route
          path="/kurir"
          element={
            <Layout>
              <DataKurir />
            </Layout>
          }
        />

        <Route
          path="/pengiriman"
          element={
            <Layout>
              <DataPengiriman />
            </Layout>
          }
        />

        <Route
          path="/laporan"
          element={
            <Layout>
              <Laporan />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
