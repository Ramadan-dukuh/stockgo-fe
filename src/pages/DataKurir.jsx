import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  UserCheck,
  UserX,
  Activity,
  Star,
  X,
  Check,
  Navigation,
  Shield,
  Truck,
  Calendar,
  Award,
  Package,
  Loader2,
} from "lucide-react";

export default function DataKurir() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [kurirData, setKurirData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(100); // Increase limit to get all kurirs
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'rating' | 'status'
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [modalValue, setModalValue] = useState("");

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Create/Edit modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKurir, setEditingKurir] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kurirForm, setKurirForm] = useState({
    user_id: "",
    license_number: "",
    vehicle_type: "",
    vehicle_plate: "",
    current_location: "",
    max_capacity: "",
  });

  // Get token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return null;
    }
    return token;
  };

  // Fetch available users
  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        "http://localhost:3000/api/kurir/available-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.users) {
          setAvailableUsers(json.data.users);
        }
      }
    } catch (err) {
      console.error("Fetch available users error:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch data dari API
  const fetchKurirs = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        `http://localhost:3000/api/kurir?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!res.ok) {
        console.error("Failed to fetch kurirs:", res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        console.error("Error data:", errorData);
        setKurirData([]);
        setTotalData(0);
        return;
      }

      const json = await res.json();
      console.log("Kurir API response:", json);

      if (json.success) {
        // Handle different response structures
        let kurirs = [];
        if (json.data?.kurirs && Array.isArray(json.data.kurirs)) {
          kurirs = json.data.kurirs;
        } else if (Array.isArray(json.data)) {
          kurirs = json.data;
        } else if (Array.isArray(json.kurirs)) {
          kurirs = json.kurirs;
        }
        
        console.log("Parsed kurirs:", kurirs);
        setKurirData(kurirs);
        setTotalData(kurirs.length);
      } else {
        console.error("Failed to fetch kurirs:", json.message);
        setKurirData([]);
        setTotalData(0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detail kurir
  const fetchKurirDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(`http://localhost:3000/api/kurir/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      if (json.success) {
        setDetailData(json.data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle create kurir
  const handleCreateKurir = async (e) => {
    e.preventDefault();
    if (!kurirForm.user_id) {
      alert("Pilih user terlebih dahulu");
      return;
    }

    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:3000/api/kurir", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kurirForm),
      });

      if (response.ok) {
        alert("Kurir berhasil ditambahkan");
        setShowCreateModal(false);
        setKurirForm({
          user_id: "",
          license_number: "",
          vehicle_type: "",
          vehicle_plate: "",
          current_location: "",
          max_capacity: "",
        });
        fetchKurirs();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal menambah kurir");
      }
    } catch (error) {
      console.error("Create kurir error:", error);
      alert(`Gagal menambah kurir: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit kurir
  const handleEditKurir = async (e) => {
    e.preventDefault();
    if (!editingKurir) return;

    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/kurir/${editingKurir.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(kurirForm),
        }
      );

      if (response.ok) {
        alert("Kurir berhasil diperbarui");
        setShowEditModal(false);
        setEditingKurir(null);
        fetchKurirs();
        if (detailData && detailData.id === editingKurir.id) {
          fetchKurirDetail(editingKurir.id);
        }
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal memperbarui kurir");
      }
    } catch (error) {
      console.error("Update kurir error:", error);
      alert(`Gagal memperbarui kurir: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete kurir
  const handleDeleteKurir = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kurir ini?")) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/api/kurir/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Kurir berhasil dihapus");
        fetchKurirs();
        if (detailModalOpen && detailData?.id === id) {
          setDetailModalOpen(false);
        }
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus kurir");
      }
    } catch (error) {
      console.error("Delete kurir error:", error);
      alert(`Gagal menghapus kurir: ${error.message}`);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    fetchAvailableUsers();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (kurir) => {
    setEditingKurir(kurir);
    setKurirForm({
      user_id: kurir.user_id?.toString() || "",
      license_number: kurir.license_number || "",
      vehicle_type: kurir.vehicle_type || "",
      vehicle_plate: kurir.vehicle_plate || "",
      current_location: kurir.current_location || "",
      max_capacity: kurir.max_capacity || "",
    });
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchKurirs();
  }, [page]);

  // Debug: log kurirData when it changes
  useEffect(() => {
    console.log("Kurir data updated:", kurirData);
  }, [kurirData]);

  // Edit Status
  const updateStatus = async (id, status) => {
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:3000/api/kurir/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      fetchKurirs();
      // Refresh detail data jika sedang dibuka
      if (detailData && detailData.id === id) {
        fetchKurirDetail(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Rating
  const updateRating = async (id, rating) => {
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:3000/api/kurir/${id}/performance`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });
      fetchKurirs();
      // Refresh detail data jika sedang dibuka
      if (detailData && detailData.id === id) {
        fetchKurirDetail(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Modal handlers
  const openModal = (type, courier) => {
    setModalType(type);
    setSelectedCourier(courier);
    setModalValue(
      type === "rating"
        ? String(courier.rating ?? "")
        : courier.status ?? "available"
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setSelectedCourier(null);
    setModalValue("");
  };

  const submitModal = async () => {
    if (!selectedCourier) return;
    if (modalType === "rating") {
      const ratingNum = Number(modalValue);
      if (isNaN(ratingNum) || ratingNum < 0) return;
      await updateRating(selectedCourier.id, ratingNum);
    } else if (modalType === "status") {
      await updateStatus(selectedCourier.id, modalValue);
    }
    closeModal();
  };

  // Search + Filter
  const filteredData = kurirData.filter((k) => {
    const matchSearch =
      k.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.user.phone.includes(searchTerm) ||
      k.employee_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" ? true : k.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      busy: "bg-blue-100 text-blue-700 border-blue-200",
      offline: "bg-red-100 text-red-700 border-red-200",
    };
    const labels = {
      available: "Available",
      busy: "Busy",
      offline: "Offline",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const stats = [
    {
      label: "Total Kurir",
      value: kurirData.length,
      icon: <Users size={20} />,
      color: "blue",
    },
    {
      label: "Available",
      value: kurirData.filter((k) => k.status === "available").length,
      icon: <UserCheck size={20} />,
      color: "emerald",
    },
    {
      label: "Busy",
      value: kurirData.filter((k) => k.status === "busy").length,
      icon: <Activity size={20} />,
      color: "amber",
    },
    {
      label: "Offline",
      value: kurirData.filter((k) => k.status === "offline").length,
      icon: <UserX size={20} />,
      color: "red",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Data Kurir</h1>
              <p className="text-slate-600 text-sm mt-1">
                Kelola dan pantau kurir Anda
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Tambah Kurir
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-4 bg-${stat.color}-50 rounded-xl group-hover:scale-110 transition-transform`}
              >
                <span className={`text-${stat.color}-600`}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-100" />
              <h2 className="text-xl font-bold text-white">Daftar Kurir</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* FILTER */}
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">Semua Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kurir..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 w-full sm:w-64 shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-slate-600 font-medium">Loading...</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kendaraan
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-600 font-medium">
                          {kurirData.length === 0 
                            ? "Belum ada data kurir" 
                            : "Tidak ada kurir yang sesuai dengan filter"}
                        </p>
                        {kurirData.length === 0 && (
                          <button
                            onClick={openCreateModal}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Tambah Kurir Pertama
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((k) => (
                    <tr key={k.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-700 font-medium">
                          {k.employee_id || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {k.user?.full_name?.charAt(0) || "?"}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {k.user?.full_name || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{k.user?.phone || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[200px]">
                              {k.user?.email || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-slate-800">
                          {k.vehicle_type}
                        </div>
                        <div className="text-slate-500 font-mono text-xs">
                          {k.vehicle_plate}
                        </div>
                      </div>
                    </td>

                    {/* RATING */}
                    <td className="px-6 py-4">
                      <div                        
                        className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors group"
                      >
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-slate-700 group-hover:text-yellow-600">
                          {k.rating}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openModal("status", k)}
                        className="hover:scale-105 transition-transform inline-block"
                      >
                        {getStatusBadge(k.status)}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => fetchKurirDetail(k.id)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => openEditModal(k)}
                          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDeleteKurir(k.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-600 font-medium">
              Menampilkan{" "}
              <span className="font-bold text-slate-800">
                {filteredData.length}
              </span>{" "}
              dari <span className="font-bold text-slate-800">{totalData}</span>{" "}
              kurir
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Previous
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-md">
                {page}
              </button>

              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Rating/Status */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === "rating"
                ? "Ubah Rating Kurir"
                : "Ubah Status Kurir"}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                {selectedCourier?.user?.full_name} •{" "}
                {selectedCourier?.employee_id}
              </p>

              {modalType === "rating" ? (
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              ) : (
                <select
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={submitModal}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto z-10">
            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-slate-600 font-medium">Memuat detail...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {detailData.user.full_name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {detailData.user.full_name}
                        </h2>
                        <p className="text-blue-100 font-mono">
                          {detailData.employee_id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDetailModalOpen(false)}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri - Informasi Personal */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Status & Rating */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-slate-600">
                              Status
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(detailData.status)}
                            <button
                              onClick={() => openModal("status", detailData)}
                              className="p-1 hover:bg-slate-200 rounded transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium text-slate-600">
                              Rating
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-slate-800">
                              {detailData.rating}
                            </span>
                            <button
                              onClick={() => openModal("rating", detailData)}
                              className="p-1 hover:bg-slate-200 rounded transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Kontak */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Informasi Kontak
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-600">Email</p>
                              <p className="text-slate-800 font-medium">
                                {detailData.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-600">Telepon</p>
                              <p className="text-slate-800 font-medium">
                                {detailData.user.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-600">
                                Status Akun
                              </p>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  detailData.user.is_active
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {detailData.user.is_active
                                  ? "Aktif"
                                  : "Nonaktif"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informasi Kendaraan */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-600" />
                          Informasi Kendaraan
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-600 mb-1">
                              Jenis Kendaraan
                            </p>
                            <p className="text-slate-800 font-medium">
                              {detailData.vehicle_type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-1">
                              Plat Nomor
                            </p>
                            <p className="text-slate-800 font-mono font-medium">
                              {detailData.vehicle_plate}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-1">
                              Nomor SIM
                            </p>
                            <p className="text-slate-800 font-medium">
                              {detailData.license_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-1">
                              Kapasitas Maksimal
                            </p>
                            <p className="text-slate-800 font-medium">
                              {detailData.max_capacity || "Tidak ditentukan"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Kolom Kanan - Statistik & Info Tambahan */}
                    <div className="space-y-6">
                      {/* Statistik */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          Statistik
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">
                              Total Pengiriman
                            </span>
                            <span className="font-bold text-slate-800">
                              {detailData.total_deliveries}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">
                              Rating
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-slate-800">
                                {detailData.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lokasi */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <Navigation className="w-5 h-5 text-blue-600" />
                          Lokasi Terkini
                        </h3>
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-sm font-mono text-slate-700 text-center">
                            {detailData.current_location ||
                              "Lokasi tidak tersedia"}
                          </p>
                        </div>
                      </div>

                      {/* Informasi Sistem */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          Informasi Sistem
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Dibuat</span>
                            <span className="text-slate-800">
                              {new Date(
                                detailData.created_at
                              ).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Diupdate</span>
                            <span className="text-slate-800">
                              {new Date(
                                detailData.updated_at
                              ).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Kurir Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Tambah Kurir Baru
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setKurirForm({
                      user_id: "",
                      license_number: "",
                      vehicle_type: "",
                      vehicle_plate: "",
                      current_location: "",
                      max_capacity: "",
                    });
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateKurir} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pilih User *
                  </label>
                  {loadingUsers ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-slate-500">Memuat users...</span>
                    </div>
                  ) : (
                    <select
                      value={kurirForm.user_id}
                      onChange={(e) =>
                        setKurirForm({ ...kurirForm, user_id: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Pilih User --</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} - {user.email}
                        </option>
                      ))}
                    </select>
                  )}
                  {availableUsers.length === 0 && !loadingUsers && (
                    <p className="text-xs text-amber-600 mt-1">
                      Semua user sudah memiliki profil kurir. Buat user baru terlebih dahulu.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nomor Lisensi
                  </label>
                  <input
                    type="text"
                    value={kurirForm.license_number}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, license_number: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: SIM-A-123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipe Kendaraan *
                  </label>
                  <select
                    value={kurirForm.vehicle_type}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, vehicle_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Pilih Tipe Kendaraan --</option>
                    <option value="Motor">Motor</option>
                    <option value="Mobil">Mobil</option>
                    <option value="Truk">Truk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    value={kurirForm.vehicle_plate}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, vehicle_plate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: B 1234 XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lokasi Saat Ini
                  </label>
                  <input
                    type="text"
                    value={kurirForm.current_location}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, current_location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Jakarta Pusat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kapasitas Maksimal (kg)
                  </label>
                  <input
                    type="number"
                    value={kurirForm.max_capacity}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, max_capacity: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 50"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setKurirForm({
                        user_id: "",
                        license_number: "",
                        vehicle_type: "",
                        vehicle_plate: "",
                        current_location: "",
                        max_capacity: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !kurirForm.user_id || !kurirForm.vehicle_type}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Tambah Kurir
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Kurir Modal */}
      {showEditModal && editingKurir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Kurir
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingKurir(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleEditKurir} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nomor Lisensi
                  </label>
                  <input
                    type="text"
                    value={kurirForm.license_number}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, license_number: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: SIM-A-123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipe Kendaraan *
                  </label>
                  <select
                    value={kurirForm.vehicle_type}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, vehicle_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Pilih Tipe Kendaraan --</option>
                    <option value="Motor">Motor</option>
                    <option value="Mobil">Mobil</option>
                    <option value="Truk">Truk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    value={kurirForm.vehicle_plate}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, vehicle_plate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: B 1234 XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lokasi Saat Ini
                  </label>
                  <input
                    type="text"
                    value={kurirForm.current_location}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, current_location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Jakarta Pusat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kapasitas Maksimal (kg)
                  </label>
                  <input
                    type="number"
                    value={kurirForm.max_capacity}
                    onChange={(e) =>
                      setKurirForm({ ...kurirForm, max_capacity: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 50"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingKurir(null);
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !kurirForm.vehicle_type}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memperbarui...
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Perbarui Kurir
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
