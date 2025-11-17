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
} from "lucide-react";

export default function DataKurir() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [kurirData, setKurirData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);

  // Modal state (ganti prompt/alert)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'rating' | 'status'
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [modalValue, setModalValue] = useState("");

  // Fetch data dari API
  const fetchKurirs = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/api/kurir?page=${page}&limit=${limit}`
      );
      const json = await res.json();

      if (json.success) {
        setKurirData(json.data.kurirs);
        setTotalData(json.data.kurirs.length);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKurirs();
  }, [page]);

  // Edit Status
  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:3000/api/kurir/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchKurirs();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Rating
  const updateRating = async (id, rating) => {
    try {
      await fetch(`http://localhost:3000/api/kurir/${id}/performance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      fetchKurirs();
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
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
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
                {filteredData.map((k) => (
                  <tr key={k.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-700 font-medium">
                        {k.employee_id}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {k.user.full_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {k.user.full_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{k.user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[200px]">
                            {k.user.email}
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
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                          <Eye className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Modal (ganti prompt/alert) */}
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
    </div>
  );
}
