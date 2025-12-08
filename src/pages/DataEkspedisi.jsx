import React, { useState, useEffect } from "react";
import {
  Truck,
  Search,
  Plus,
  Edit2,
  Eye,
  Filter,
  Download,
  Package,
  MapPin,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Phone,
  Mail,
  Navigation,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileBarChart,
  Users,
  Building,
  ListChecks,
} from "lucide-react";

export default function DataEkspedisi() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [ekspedisiData, setEkspedisiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [kurirs, setKurirs] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  // Form state untuk create expedition
  const [expeditionForm, setExpeditionForm] = useState({
    warehouse_id: "",
    kurir_id: "",
    notes: "",
    delivery_ids: [],
  });

  // Fungsi untuk mendapatkan token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return null;
    }
    return token;
  };

  // Fetch data dari API
  useEffect(() => {
    fetchExpeditions();
    fetchWarehouses();
    fetchKurirs();
    fetchAvailableDeliveries();
  }, []);

  const fetchExpeditions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) return;

      const res = await fetch(
        "http://localhost:3000/api/expeditions?page=1&limit=50",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error(`Error ${res.status}: Gagal mengambil data ekspedisi`);
      }

      const data = await res.json();
      console.log("Expeditions API Response:", data);

      if (data.success) {
        const expeditions = data.data?.expeditions || data.data || [];
        const normalizedData = expeditions.map((item) => ({
          id: item.id,
          expedition_code:
            item.expedition_code ||
            `EXP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          warehouse_id: item.warehouse_id,
          warehouse: item.warehouse,
          warehouse_name: item.warehouse?.name || "Gudang Tidak Diketahui",
          kurir_id: item.kurir_id,
          kurir: item.kurir,
          kurir_name: item.kurir?.name || "Belum ditugaskan",
          notes: item.notes,
          status: item.status || "pending",
          status_label: getStatusLabel(item.status),
          created_by: item.created_by,
          creator: item.creator,
          creator_name: item.creator?.name || "System",
          created_at: item.created_at,
          updated_at: item.updated_at,
          items: item.items || [],
          delivery_count: item.items?.length || 0,
          // Format tanggal untuk display
          tanggal_dibuat: item.created_at
            ? new Date(item.created_at).toLocaleDateString("id-ID")
            : new Date().toLocaleDateString("id-ID"),
          waktu_dibuat: item.created_at
            ? new Date(item.created_at).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          rawData: item,
        }));

        setEkspedisiData(normalizedData);
      } else {
        setEkspedisiData([]);
        setError(data.message || "Gagal mengambil data ekspedisi");
      }
    } catch (err) {
      console.error("Fetch expeditions error:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      setEkspedisiData(getDummyData());
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/warehouses", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWarehouses(data.data?.warehouses || data.data || []);
        }
      }
    } catch (err) {
      console.error("Fetch warehouses error:", err);
    }
  };

  const fetchKurirs = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        "http://localhost:3000/api/kurirs?status=active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setKurirs(data.data?.kurirs || data.data || []);
        }
      }
    } catch (err) {
      console.error("Fetch kurirs error:", err);
    }
  };

  const fetchAvailableDeliveries = async () => {
    try {
      const token = getToken();
      if (!token) return;

      // Fetch deliveries dengan status pending yang belum masuk ekspedisi
      const res = await fetch(
        "http://localhost:3000/api/deliveries?status=pending&limit=100",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDeliveries(data.data?.deliveries || data.data || []);
        }
      }
    } catch (err) {
      console.error("Fetch available deliveries error:", err);
    }
  };

  // Helper functions
  const getStatusLabel = (status) => {
    const labels = {
      pending: "Menunggu",
      processing: "Diproses",
      shipped: "Dikirim",
      delivered: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
          styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {getStatusLabel(status)}
      </span>
    );
  };

  // Data dummy fallback
  const getDummyData = () => {
    return [
      {
        id: 1,
        expedition_code: "EXP-20241208-001",
        warehouse_name: "Gudang Pusat Jakarta",
        kurir_name: "Budi Santoso",
        status: "processing",
        status_label: "Diproses",
        delivery_count: 5,
        tanggal_dibuat: "08/12/2024",
        waktu_dibuat: "10:30",
        notes: "Ekspedisi ke wilayah Jakarta Pusat",
        items: [
          { delivery_id: 1, tracking_number: "DLV-001" },
          { delivery_id: 2, tracking_number: "DLV-002" },
          { delivery_id: 3, tracking_number: "DLV-003" },
        ],
      },
      {
        id: 2,
        expedition_code: "EXP-20241208-002",
        warehouse_name: "Gudang Tangerang",
        kurir_name: "Andi Wijaya",
        status: "shipped",
        status_label: "Dikirim",
        delivery_count: 3,
        tanggal_dibuat: "08/12/2024",
        waktu_dibuat: "11:45",
        notes: "Ekspedisi ke Tangerang dan sekitarnya",
        items: [
          { delivery_id: 4, tracking_number: "DLV-004" },
          { delivery_id: 5, tracking_number: "DLV-005" },
        ],
      },
      {
        id: 3,
        expedition_code: "EXP-20241207-001",
        warehouse_name: "Gudang Bandung",
        kurir_name: "Rudi Hartono",
        status: "delivered",
        status_label: "Selesai",
        delivery_count: 4,
        tanggal_dibuat: "07/12/2024",
        waktu_dibuat: "14:20",
        notes: "Ekspedisi kemarin sudah selesai",
        items: [
          { delivery_id: 6, tracking_number: "DLV-006" },
          { delivery_id: 7, tracking_number: "DLV-007" },
          { delivery_id: 8, tracking_number: "DLV-008" },
        ],
      },
      {
        id: 4,
        expedition_code: "EXP-20241208-003",
        warehouse_name: "Gudang Pusat Jakarta",
        kurir_name: "Siti Nurhaliza",
        status: "pending",
        status_label: "Menunggu",
        delivery_count: 2,
        tanggal_dibuat: "08/12/2024",
        waktu_dibuat: "15:10",
        notes: null,
        items: [{ delivery_id: 9, tracking_number: "DLV-009" }],
      },
    ];
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewDetails = (expedition) => {
    setSelectedExpedition(expedition);
    setShowModal(true);
  };

  const handleCreateExpedition = async (e) => {
    e.preventDefault();

    if (!expeditionForm.warehouse_id) {
      alert("Pilih gudang terlebih dahulu");
      return;
    }

    if (expeditionForm.delivery_ids.length === 0) {
      alert("Pilih minimal 1 pengiriman");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/api/expeditions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          warehouse_id: parseInt(expeditionForm.warehouse_id),
          kurir_id: expeditionForm.kurir_id
            ? parseInt(expeditionForm.kurir_id)
            : null,
          notes: expeditionForm.notes,
          delivery_ids: expeditionForm.delivery_ids.map((id) => parseInt(id)),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Ekspedisi berhasil dibuat");
        setShowCreateModal(false);
        setExpeditionForm({
          warehouse_id: "",
          kurir_id: "",
          notes: "",
          delivery_ids: [],
        });
        fetchExpeditions();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal membuat ekspedisi");
      }
    } catch (error) {
      console.error("Create expedition error:", error);
      alert(`Gagal membuat ekspedisi: ${error.message}`);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!confirm(`Ubah status ekspedisi ke "${getStatusLabel(newStatus)}"?`))
      return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/expeditions/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        alert("Status berhasil diperbarui");
        fetchExpeditions();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert(`Gagal memperbarui status: ${error.message}`);
    }
  };

  // Toggle delivery selection
  const toggleDeliverySelection = (deliveryId) => {
    setExpeditionForm((prev) => {
      if (prev.delivery_ids.includes(deliveryId)) {
        return {
          ...prev,
          delivery_ids: prev.delivery_ids.filter((id) => id !== deliveryId),
        };
      } else {
        return {
          ...prev,
          delivery_ids: [...prev.delivery_ids, deliveryId],
        };
      }
    });
  };

  // Filter data berdasarkan search dan status
  const filteredData = ekspedisiData.filter((item) => {
    const matchesSearch =
      item.expedition_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kurir_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creator_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Stats cards data
  const stats = [
    {
      label: "Total Ekspedisi",
      value: ekspedisiData.length,
      icon: <Truck size={20} />,
      color: "blue",
      trend: `+${Math.floor(Math.random() * 15)}%`,
    },
    {
      label: "Dalam Proses",
      value: ekspedisiData.filter(
        (p) => p.status === "processing" || p.status === "shipped"
      ).length,
      icon: <Clock size={20} />,
      color: "blue",
      trend: "aktif",
    },
    {
      label: "Selesai",
      value: ekspedisiData.filter((p) => p.status === "delivered").length,
      icon: <CheckCircle size={20} />,
      color: "emerald",
      trend: "Hari ini",
    },
    {
      label: "Menunggu",
      value: ekspedisiData.filter((p) => p.status === "pending").length,
      icon: <ListChecks size={20} />,
      color: "amber",
      trend: "pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">
              Data Ekspedisi
            </h1>
          </div>
          <button
            onClick={fetchExpeditions}
            disabled={loading}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <p className="text-slate-600 ml-14">
          Kelola dan pantau semua ekspedisi pengiriman
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

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
              Daftar Ekspedisi ({ekspedisiData.length})
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
                  <option value="pending">Menunggu</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="delivered">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode ekspedisi, kurir, atau gudang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 border border-white/30"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white text-blue-700 px-5 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Buat Ekspedisi</span>
                  <span className="sm:hidden">Buat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600">Memuat data ekspedisi...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Tidak ada ekspedisi yang sesuai dengan filter"
                  : "Belum ada data ekspedisi"}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Buat Ekspedisi Pertama
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kode Ekspedisi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Gudang & Kurir
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Jumlah Pengiriman
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tanggal & Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredData.map((item, index) => (
                  <React.Fragment key={item.expedition_code || item.id}>
                    <tr className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-700 text-xs font-semibold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">
                              {item.expedition_code}
                            </span>
                            <span className="text-xs text-slate-500">
                              ID: {item.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-800">
                              {item.warehouse_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              Kurir: {item.kurir_name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-800">
                              {item.delivery_count} pengiriman
                            </span>
                          </div>
                          <button
                            onClick={() => toggleRowExpand(item.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            {expandedRows[item.id] ? (
                              <>
                                <ChevronUp size={10} /> Sembunyikan
                              </>
                            ) : (
                              <>
                                <ChevronDown size={10} /> Lihat Detail
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              {item.tanggal_dibuat} {item.waktu_dibuat}
                            </span>
                          </div>
                          <div className="mt-2">
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                            title="Detail Lengkap"
                          >
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/ekspedisi/edit/${item.id}`)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row with Details */}
                    {expandedRows[item.id] && (
                      <tr className="bg-blue-50 border-b border-blue-100">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                                <FileText size={16} />
                                Detail Ekspedisi: {item.expedition_code}
                              </h3>
                              <span className="text-xs text-blue-600">
                                Dibuat oleh: {item.creator_name}
                              </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Notes */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2">
                                  Catatan
                                </h4>
                                <div className="text-sm">
                                  {item.notes ? (
                                    <p className="text-slate-600">
                                      {item.notes}
                                    </p>
                                  ) : (
                                    <p className="text-slate-400 italic">
                                      Tidak ada catatan
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Status Actions */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2">
                                  Ubah Status
                                </h4>
                                <div className="space-y-2">
                                  {item.status === "pending" && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(
                                          item.id,
                                          "processing"
                                        )
                                      }
                                      className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                    >
                                      Tandai Diproses
                                    </button>
                                  )}
                                  {item.status === "processing" && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(item.id, "shipped")
                                      }
                                      className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                                    >
                                      Tandai Dikirim
                                    </button>
                                  )}
                                  {item.status === "shipped" && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(item.id, "delivered")
                                      }
                                      className="w-full px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-sm hover:bg-emerald-200"
                                    >
                                      Tandai Selesai
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Delivery Items */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2">
                                  Daftar Pengiriman ({item.delivery_count})
                                </h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {item.items?.map((deliveryItem, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-slate-50 p-2 rounded border"
                                    >
                                      <p className="text-sm font-medium">
                                        {deliveryItem.tracking_number ||
                                          `Delivery ${idx + 1}`}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        ID: {deliveryItem.delivery_id}
                                      </p>
                                    </div>
                                  )) || (
                                    <p className="text-sm text-slate-400">
                                      Belum ada data pengiriman
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
            <span>
              Menampilkan{" "}
              <span className="font-semibold text-slate-800">
                {filteredData.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-800">
                {ekspedisiData.length}
              </span>{" "}
              ekspedisi
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

      {/* Create Expedition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Buat Ekspedisi Baru
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateExpedition}>
                <div className="space-y-6">
                  {/* Expedition Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Gudang *
                      </label>
                      <select
                        value={expeditionForm.warehouse_id}
                        onChange={(e) =>
                          setExpeditionForm((prev) => ({
                            ...prev,
                            warehouse_id: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Gudang</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} - {warehouse.location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kurir (Opsional)
                      </label>
                      <select
                        value={expeditionForm.kurir_id}
                        onChange={(e) =>
                          setExpeditionForm((prev) => ({
                            ...prev,
                            kurir_id: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Kurir</option>
                        {kurirs.map((kurir) => (
                          <option key={kurir.id} value={kurir.id}>
                            {kurir.name} - {kurir.vehicle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={expeditionForm.notes}
                      onChange={(e) =>
                        setExpeditionForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Catatan untuk ekspedisi ini..."
                    />
                  </div>

                  {/* Available Deliveries */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-slate-700">
                        Pilih Pengiriman *
                      </label>
                      <span className="text-sm text-slate-600">
                        Terpilih: {expeditionForm.delivery_ids.length}{" "}
                        pengiriman
                      </span>
                    </div>

                    <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto">
                      {deliveries.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                          <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p>Tidak ada pengiriman yang tersedia</p>
                          <p className="text-sm">
                            Semua pengiriman sudah masuk ekspedisi
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {deliveries.map((delivery) => (
                            <div
                              key={delivery.id}
                              className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                                expeditionForm.delivery_ids.includes(
                                  delivery.id
                                )
                                  ? "bg-blue-50 border-l-4 border-blue-500"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleDeliverySelection(delivery.id)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                      expeditionForm.delivery_ids.includes(
                                        delivery.id
                                      )
                                        ? "bg-blue-500 border-blue-500 text-white"
                                        : "border-slate-300"
                                    }`}
                                  >
                                    {expeditionForm.delivery_ids.includes(
                                      delivery.id
                                    )
                                      ? "✓"
                                      : ""}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {delivery.tracking_number ||
                                        delivery.delivery?.tracking_number}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {delivery.customer?.name ||
                                        delivery.delivery?.customer?.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {delivery.delivery_address ||
                                        delivery.delivery?.delivery_address}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-slate-700">
                                    {delivery.total_weight
                                      ? `${parseFloat(
                                          delivery.total_weight
                                        ).toFixed(2)} kg`
                                      : "0 kg"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {delivery.total_value
                                      ? `Rp ${parseFloat(
                                          delivery.total_value
                                        ).toLocaleString("id-ID")}`
                                      : "Rp 0"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={expeditionForm.delivery_ids.length === 0}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buat Ekspedisi
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedExpedition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Detail Ekspedisi
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Kode Ekspedisi
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        {selectedExpedition.expedition_code}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">Status:</span>
                        {getStatusBadge(selectedExpedition.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Dibuat pada</p>
                      <p className="font-medium">
                        {selectedExpedition.tanggal_dibuat}{" "}
                        {selectedExpedition.waktu_dibuat}
                      </p>
                      <p className="text-sm text-slate-500">
                        Oleh: {selectedExpedition.creator_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expedition Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Warehouse & Kurir */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Building size={18} /> Informasi Gudang & Kurir
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Gudang</p>
                        <p className="font-medium">
                          {selectedExpedition.warehouse_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Kurir</p>
                        <p className="font-medium">
                          {selectedExpedition.kurir_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Summary */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Package size={18} /> Ringkasan Pengiriman
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">
                          Jumlah Pengiriman
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedExpedition.delivery_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedExpedition.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedExpedition.notes && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <FileText size={18} /> Catatan Khusus
                    </h3>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-slate-700">
                        {selectedExpedition.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery Items */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-bold text-slate-800 mb-3">
                    Daftar Pengiriman
                  </h3>
                  <div className="space-y-3">
                    {selectedExpedition.items &&
                    selectedExpedition.items.length > 0 ? (
                      selectedExpedition.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {item.tracking_number || `Delivery ${idx + 1}`}
                              </p>
                              <p className="text-sm text-slate-600">
                                ID: {item.delivery_id}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                (window.location.href = `/pengiriman/detail/${item.delivery_id}`)
                              }
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Lihat Detail →
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-slate-500">
                          Belum ada data pengiriman
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  {selectedExpedition.status === "pending" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedExpedition.id, "processing")
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Tandai Diproses
                    </button>
                  )}
                  {selectedExpedition.status === "processing" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedExpedition.id, "shipped")
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Tandai Dikirim
                    </button>
                  )}
                  {selectedExpedition.status === "shipped" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedExpedition.id, "delivered")
                      }
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Tandai Selesai
                    </button>
                  )}
                  <button
                    onClick={() =>
                      (window.location.href = `/ekspedisi/edit/${selectedExpedition.id}`)
                    }
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Edit Ekspedisi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
