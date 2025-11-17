import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Download,
  Box,
  Tag,
  Layers,
} from "lucide-react";
import Layout from "../components/layout";

export default function DataBarang() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");

  // Sample data - nanti bisa diganti dengan data dari DB
  const barangData = [
    {
      id: "BRG001",
      nama: "Laptop Dell XPS 13",
      kategori: "Elektronik",
      stok: 15,
      harga: "Rp 18.500.000",
      gudang: "Gudang Utama",
      status: "tersedia",
    },
    {
      id: "BRG002",
      nama: "Smartphone Samsung S24",
      kategori: "Elektronik",
      stok: 8,
      harga: "Rp 12.000.000",
      gudang: "Gudang Cabang A",
      status: "terbatas",
    },
    {
      id: "BRG003",
      nama: "Monitor LG 27 inch",
      kategori: "Elektronik",
      stok: 24,
      harga: "Rp 3.500.000",
      gudang: "Gudang Utama",
      status: "tersedia",
    },
    {
      id: "BRG004",
      nama: "Keyboard Mechanical Logitech",
      kategori: "Aksesoris",
      stok: 42,
      harga: "Rp 1.200.000",
      gudang: "Gudang Cabang B",
      status: "tersedia",
    },
    {
      id: "BRG005",
      nama: "Mouse Gaming Razer",
      kategori: "Aksesoris",
      stok: 3,
      harga: "Rp 850.000",
      gudang: "Gudang Utama",
      status: "terbatas",
    },
    {
      id: "BRG006",
      nama: "Headset Sony WH-1000XM5",
      kategori: "Audio",
      stok: 0,
      harga: "Rp 4.500.000",
      gudang: "Gudang Cabang A",
      status: "habis",
    },
  ];

  const kategoriList = ["all", "Elektronik", "Aksesoris", "Audio"];

  const getStatusBadge = (status, stok) => {
    if (status === "habis" || stok === 0) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
          Habis
        </span>
      );
    } else if (status === "terbatas" || stok < 10) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          Terbatas
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
          Tersedia
        </span>
      );
    }
  };

  const getStokColor = (stok) => {
    if (stok === 0) return "text-red-600 font-bold";
    if (stok < 10) return "text-amber-600 font-semibold";
    return "text-emerald-600 font-semibold";
  };

  // Stats cards data
  const stats = [
    {
      label: "Total Barang",
      value: barangData.length,
      icon: <Package size={20} />,
      color: "blue",
    },
    {
      label: "Stok Tersedia",
      value: barangData.filter((b) => b.stok > 10).length,
      icon: <Box size={20} />,
      color: "emerald",
    },
    {
      label: "Stok Terbatas",
      value: barangData.filter((b) => b.stok > 0 && b.stok <= 10).length,
      icon: <Layers size={20} />,
      color: "amber",
    },
    {
      label: "Stok Habis",
      value: barangData.filter((b) => b.stok === 0).length,
      icon: <Tag size={20} />,
      color: "red",
    },
  ];

  return (
    
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Data Barang</h1>
          </div>
          <p className="text-slate-600 ml-14">
            Kelola inventori dan stok barang Anda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                  <span className={`text-${stat.color}-600`}>{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                Daftar Barang
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Filter Kategori */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full sm:w-40"
                  >
                    <option value="all">Semua</option>
                    {kategoriList
                      .filter((k) => k !== "all")
                      .map((kategori) => (
                        <option key={kategori} value={kategori}>
                          {kategori}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari barang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 border border-white/30">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <button className="bg-white text-blue-700 px-5 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                    <Plus className="w-5 h-5" />
                    <span>Tambah Barang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID Barang
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nama Barang
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Gudang
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {barangData.map((barang, index) => (
                  <tr
                    key={barang.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-700 text-xs font-semibold">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {barang.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-800">
                          {barang.nama}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700">
                        {barang.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-sm font-semibold ${getStokColor(
                          barang.stok
                        )}`}
                      >
                        {barang.stok} unit
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">
                        {barang.harga}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {barang.gudang}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(barang.status, barang.stok)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
              <span>
                Menampilkan{" "}
                <span className="font-semibold text-slate-800">
                  {barangData.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-800">
                  {barangData.length}
                </span>{" "}
                barang
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-100 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  1
                </button>
                <button className="px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-100 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}
