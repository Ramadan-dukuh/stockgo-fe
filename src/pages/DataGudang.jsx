import React, { useEffect, useState } from "react";
import {
  Warehouse,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  Phone,
  Mail,
  Hash,
  Layers,
  X,
  Check,
} from "lucide-react";

const API_BASE = "http://localhost:3000/api/warehouses";

export default function DataGudang() {
  // states
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState(null);

  // modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // data holders
  const [detailData, setDetailData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // form for create
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "main",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
    email: "",
  });

  // form for edit
  const [editForm, setEditForm] = useState({ ...formData });

  // simple notification state
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // --- load list ---
  const loadWarehouses = async (page = 1, limit = 10) => {
    try {
      setLoadingList(true);
      setErrorList(null);
      const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil data");
      }
      setWarehouses(json.data?.warehouses ?? []);
    } catch (err) {
      console.error(err);
      setErrorList(err.message || "Error");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  // --- helper: show toast briefly ---
  const showToast = (msg, ms = 2500) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  // ============================
  // CREATE (POST)
  // ============================
  const handleAddWarehouse = async () => {
    try {
      setBusy(true);
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menambah gudang");
      }
      setShowAddModal(false);
      setFormData({
        name: "",
        code: "",
        type: "main",
        address: "",
        city: "",
        province: "",
        postal_code: "",
        phone: "",
        email: "",
      });
      await loadWarehouses();
      showToast("Gudang berhasil ditambahkan");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error tambah gudang");
    } finally {
      setBusy(false);
    }
  };

  // ============================
  // GET DETAIL (by id)
  // ============================
  const openDetailModal = async (id) => {
    try {
      setBusy(true);
      setDetailData(null);
      setSelectedId(id);
      const res = await fetch(`${API_BASE}/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal ambil detail");
      setDetailData(json.data ?? json);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Gagal ambil detail");
    } finally {
      setBusy(false);
    }
  };

  // ============================
  // OPEN EDIT (prefill) -> show edit modal
  // ============================
  const openEditFromDetail = () => {
    if (!detailData) return;
    setEditForm({
      name: detailData.name ?? "",
      code: detailData.code ?? "",
      type: detailData.type ?? "main",
      address: detailData.address ?? "",
      city: detailData.city ?? "",
      province: detailData.province ?? "",
      postal_code: detailData.postal_code ?? "",
      phone: detailData.phone ?? "",
      email: detailData.email ?? "",
    });
    setShowEditModal(true);
  };

  // ============================
  // UPDATE (PUT)
  // ============================
  const handleUpdateWarehouse = async (e) => {
    e?.preventDefault();
    if (!selectedId) return;
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal update gudang");
      setShowEditModal(false);
      setShowDetailModal(false);
      await loadWarehouses();
      showToast("Perubahan tersimpan");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Gagal update");
    } finally {
      setBusy(false);
    }
  };

  // ============================
  // DELETE
  // ============================
  const handleDeleteWarehouse = async () => {
    if (!selectedId) return;
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/${selectedId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal hapus gudang");
      setShowDeleteModal(false);
      setShowDetailModal(false);
      await loadWarehouses();
      showToast("Gudang dihapus");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Gagal hapus");
    } finally {
      setBusy(false);
    }
  };

  // ============================
  // filtered list by search
  // ============================
  const filtered = warehouses.filter((w) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(w.name ?? "")
        .toLowerCase()
        .includes(q) ||
      String(w.code ?? "")
        .toLowerCase()
        .includes(q) ||
      String(w.city ?? "")
        .toLowerCase()
        .includes(q) ||
      String(w.province ?? "")
        .toLowerCase()
        .includes(q)
    );
  });

  // ----------------- render -----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Warehouse className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Data Gudang</h1>
        </div>
        <p className="text-slate-600 ml-14">
          Kelola dan pantau seluruh gudang Anda
        </p>
      </div>

      {/* main card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* header with search and button */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Daftar Gudang</h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari gudang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-blue-700 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Tambah Gudang
              </button>
            </div>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          {loadingList ? (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              <div>Memuat data...</div>
            </div>
          ) : errorList ? (
            <div className="p-8 text-center text-red-600 bg-red-50 mx-6 my-4 rounded-lg">
              <div className="font-medium">Error: {errorList}</div>
              <button
                onClick={() => loadWarehouses()}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Coba lagi
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kota
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tipe
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center">
                        <Warehouse className="w-12 h-12 text-slate-300 mb-2" />
                        <p>Tidak ada data gudang</p>
                        {searchTerm && (
                          <p className="text-sm mt-1">
                            Tidak ditemukan hasil untuk "{searchTerm}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => openDetailModal(g.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-sm font-medium text-blue-600">
                            {g.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{g.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{g.city}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            g.type === "main"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {g.type === "main" ? "Main" : "Branch"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center">
          <span>Total: {warehouses.length} gudang</span>
          {filtered.length !== warehouses.length && (
            <span className="text-blue-600">
              {filtered.length} hasil pencarian
            </span>
          )}
        </div>
      </div>

      {/* =============== ADD MODAL =============== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <Plus className="w-5 h-5 text-blue-600" />
                Tambah Gudang Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Gudang <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan nama gudang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kode Gudang <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="GDG-XXX-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Gudang
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="main">Main Gudang</option>
                  <option value="branch">Branch Gudang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kota <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Jakarta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="DKI Jakarta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kode Pos
                </label>
                <input
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telepon
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="021-xxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="gudang@company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors h-24 resize-none"
                  placeholder="Jl. Raya No..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                Batal
              </button>

              <button
                onClick={handleAddWarehouse}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Simpan Gudang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============== DETAIL MODAL =============== */}
      {showDetailModal && detailData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  Detail Gudang
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Informasi lengkap gudang
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailData(null);
                  setSelectedId(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Nama Gudang
                  </span>
                </div>
                <p className="text-slate-800 font-medium">
                  {detailData.name || "-"}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Kode Gudang
                  </span>
                </div>
                <p className="text-slate-800 font-mono font-medium">
                  {detailData.code || "-"}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Tipe Gudang
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    detailData.type === "main"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {detailData.type === "main" ? "Main Gudang" : "Branch Gudang"}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Kota
                  </span>
                </div>
                <p className="text-slate-800">{detailData.city || "-"}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Provinsi
                  </span>
                </div>
                <p className="text-slate-800">{detailData.province || "-"}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Kode Pos
                  </span>
                </div>
                <p className="text-slate-800">
                  {detailData.postal_code || "-"}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Telepon
                  </span>
                </div>
                <p className="text-slate-800">{detailData.phone || "-"}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Email
                  </span>
                </div>
                <p className="text-slate-800">{detailData.email || "-"}</p>
              </div>

              <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    Alamat Lengkap
                  </span>
                </div>
                <p className="text-slate-800 whitespace-pre-line">
                  {detailData.address || "-"}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-sm font-medium text-slate-600 mb-2">
                  Dibuat Pada
                </div>
                <p className="text-slate-800 text-sm">
                  {detailData.created_at || "-"}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-sm font-medium text-slate-600 mb-2">
                  Diupdate Pada
                </div>
                <p className="text-slate-800 text-sm">
                  {detailData.updated_at || "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={openEditFromDetail}
                className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailData(null);
                  setSelectedId(null);
                }}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============== EDIT MODAL =============== */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Edit Data Gudang
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateWarehouse}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Gudang
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kode Gudang
                </label>
                <input
                  value={editForm.code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Gudang
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="main">Main Gudang</option>
                  <option value="branch">Branch Gudang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kota
                </label>
                <input
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Provinsi
                </label>
                <input
                  value={editForm.province}
                  onChange={(e) =>
                    setEditForm({ ...editForm, province: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kode Pos
                </label>
                <input
                  value={editForm.postal_code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, postal_code: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telepon
                </label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors h-24 resize-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============== DELETE CONFIRM =============== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Hapus Gudang
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Anda akan menghapus gudang:
              </p>
              <p className="font-medium text-slate-800 mb-2">
                {detailData?.name}
              </p>
              <p className="text-sm text-slate-600">
                Tindakan ini tidak bisa dikembalikan. Yakin ingin melanjutkan?
              </p>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteWarehouse}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  "Hapus Sekarang"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg z-60 animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
