import React, { useState } from "react";
import {
  Send,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Download,
  Package,
  MapPin,
  User,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Layout from "../components/layout";

export default function DataPengiriman() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Sample data - nanti bisa diganti dengan data dari DB
  const pengirimanData = [
    {
      id: "DLV001",
      barang: "Laptop Dell XPS 13",
      pengirim: "PT. Tech Store",
      penerima: "Ahmad Yani",
      alamatTujuan: "Jakarta Pusat",
      kurir: "Budi Santoso",
      tanggal: "2024-11-07",
      estimasi: "2024-11-08",
      status: "dalam_pengiriman",
      berat: "2.5 kg",
    },
    {
      id: "DLV002",
      barang: "Smartphone Samsung S24",
      pengirim: "Toko Elektronik Jaya",
      penerima: "Siti Rahma",
      alamatTujuan: "Tangerang",
      kurir: "Andi Wijaya",
      tanggal: "2024-11-07",
      estimasi: "2024-11-09",
      status: "dalam_pengiriman",
      berat: "0.8 kg",
    },
    {
      id: "DLV003",
      barang: "Monitor LG 27 inch",
      pengirim: "CV. Komputer Indo",
      penerima: "Budi Hartono",
      alamatTujuan: "Bekasi",
      kurir: "Rudi Hartono",
      tanggal: "2024-11-06",
      estimasi: "2024-11-07",
      status: "terkirim",
      berat: "5.2 kg",
    },
    {
      id: "DLV004",
      barang: "Keyboard Mechanical",
      pengirim: "Gaming Store",
      penerima: "Dewi Lestari",
      alamatTujuan: "Depok",
      kurir: "Siti Nurhaliza",
      tanggal: "2024-11-07",
      estimasi: "2024-11-08",
      status: "dalam_pengiriman",
      berat: "1.2 kg",
    },
    {
      id: "DLV005",
      barang: "Mouse Gaming Logitech",
      pengirim: "Tech Paradise",
      penerima: "Eko Prasetyo",
      alamatTujuan: "Bogor",
      kurir: "Dewi Lestari",
      tanggal: "2024-11-05",
      estimasi: "2024-11-06",
      status: "terkirim",
      berat: "0.3 kg",
    },
    {
      id: "DLV006",
      barang: "Headset Sony WH-1000XM5",
      pengirim: "Audio Store",
      penerima: "Rina Kusuma",
      alamatTujuan: "Jakarta Selatan",
      kurir: "Ahmad Dahlan",
      tanggal: "2024-11-07",
      estimasi: "2024-11-08",
      status: "menunggu",
      berat: "0.5 kg",
    },
    {
      id: "DLV007",
      barang: "Printer Canon",
      pengirim: "Office Supply Co",
      penerima: "Rudi Setiawan",
      alamatTujuan: "Tangerang Selatan",
      kurir: "Budi Santoso",
      tanggal: "2024-11-06",
      estimasi: "2024-11-07",
      status: "dibatalkan",
      berat: "8.5 kg",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      dalam_pengiriman: "bg-blue-100 text-blue-700 border-blue-200",
      terkirim: "bg-emerald-100 text-emerald-700 border-emerald-200",
      menunggu: "bg-amber-100 text-amber-700 border-amber-200",
      dibatalkan: "bg-red-100 text-red-700 border-red-200",
    };
    const labels = {
      dalam_pengiriman: "Dalam Pengiriman",
      terkirim: "Terkirim",
      menunggu: "Menunggu",
      dibatalkan: "Dibatalkan",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // Stats cards data
  const stats = [
    {
      label: "Total Pengiriman",
      value: pengirimanData.length,
      icon: <Send size={20} />,
      color: "blue",
      trend: "+12%",
    },
    {
      label: "Dalam Pengiriman",
      value: pengirimanData.filter((p) => p.status === "dalam_pengiriman")
        .length,
      icon: <TrendingUp size={20} />,
      color: "blue",
      trend: "3 aktif",
    },
    {
      label: "Berhasil Terkirim",
      value: pengirimanData.filter((p) => p.status === "terkirim").length,
      icon: <CheckCircle size={20} />,
      color: "emerald",
      trend: "Hari ini",
    },
    {
      label: "Menunggu/Batal",
      value: pengirimanData.filter(
        (p) => p.status === "menunggu" || p.status === "dibatalkan"
      ).length,
      icon: <Clock size={20} />,
      color: "amber",
      trend: "2 pending",
    },
  ];

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Send className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Data Pengiriman</h1>
        </div>
        <p className="text-slate-600 ml-14">
          Monitor dan kelola semua aktivitas pengiriman
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                <span className={`text-${stat.color}-600`}>{stat.icon}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">
              Daftar Pengiriman
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter Status */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full sm:w-48"
                >
                  <option value="all">Semua Status</option>
                  <option value="dalam_pengiriman">Dalam Pengiriman</option>
                  <option value="terkirim">Terkirim</option>
                  <option value="menunggu">Menunggu</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pengiriman..."
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
                  <span>Tambah Pengiriman</span>
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
                  ID Pengiriman
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Barang
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Penerima
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kurir
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tanggal
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
              {pengirimanData.map((item, index) => (
                <tr
                  key={item.id}
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
                        {item.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-800">
                          {item.barang}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 ml-6">
                        Berat: {item.berat}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-medium text-slate-800">
                          {item.penerima}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600">
                          {item.alamatTujuan}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {item.kurir.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700">
                        {item.kurir}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600">
                          {item.tanggal}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 ml-5">
                        Est: {item.estimasi}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                        title="Tracking"
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
                        title="Batalkan"
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
                {pengirimanData.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-800">
                {pengirimanData.length}
              </span>{" "}
              pengiriman
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
