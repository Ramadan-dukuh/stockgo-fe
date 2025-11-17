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
  const [detailData, setDetailData] = useState(null); // full detail for selected item
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

  // form for edit (separate so editing doesn't mutate detail until saved)
  const [editForm, setEditForm] = useState({ ...formData });

  // simple notification state
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // --- load list (page/limit currently fixed) ---
  const loadWarehouses = async (page = 1, limit = 10) => {
    try {
      setLoadingList(true);
      setErrorList(null);
      const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil data");
      }
      // API structure: { data: { warehouses: [ ... ] } }
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
      // reset form
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
      setDetailData(json.data ?? json); // accommodate APIs that return directly
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
    // copy fields into editForm
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

  // ---------- simple Input component helper ----------
  const Input = ({ icon: Icon, className = "", ...rest }) => (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      )}
      <input
        {...rest}
        className={`w-full p-2 pl-${
          Icon ? "10" : "3"
        } rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm`}
      />
    </div>
  );

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

      {/* card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* top */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Daftar Gudang</h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari gudang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white pl-10 pr-4 py-2 rounded-lg border w-full sm:w-64 text-sm"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-blue-700 px-5 py-2 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2 shadow-md"
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
            <div className="p-6 text-center text-slate-500">Memuat data...</div>
          ) : errorList ? (
            <div className="p-6 text-center text-red-600">
              Error: {errorList}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Kode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Kota
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => openDetailModal(g.id)}
                      className="hover:bg-slate-50 cursor-pointer border-b"
                    >
                      <td className="px-6 py-4">{g.code}</td>
                      <td className="px-6 py-4">{g.name}</td>
                      <td className="px-6 py-4">{g.city}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t text-sm text-slate-600">
          Total: {warehouses.length} gudang
        </div>
      </div>

      {/* =============== ADD MODAL =============== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl animate-scale">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Tambah Gudang
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-slate-600">Nama Gudang</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="Nama Gudang"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Kode</label>
                <input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="GDG-XXX-001"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Tipe</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="input mt-1"
                >
                  <option value="main">Main</option>
                  <option value="branch">Branch</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600">Kota</label>
                <input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="Jakarta"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Provinsi</label>
                <input
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="DKI Jakarta"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Kode Pos</label>
                <input
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Telepon</label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="021-xxxxxxx"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input mt-1"
                  placeholder="gudang@company.com"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-600">Alamat Lengkap</label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input mt-1 h-24"
                  placeholder="Jl. Raya No..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Batal
              </button>

              <button
                onClick={handleAddWarehouse}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                disabled={busy}
              >
                {busy ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Simpan
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
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl animate-scale">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">Detail Gudang</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setDetailData(null);
                    setSelectedId(null);
                  }}
                  className="p-2 rounded hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>NAME:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.name || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>CODE:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.code || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>TYPE:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.type || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>CITY:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.city || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50 col-span-2">
                <strong>ADDRESS:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.address || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>PROVINCE:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.province || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>POSTAL CODE:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.postal_code || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>PHONE:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.phone || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>EMAIL:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.email || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>CREATED AT:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.created_at || "-"}
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-slate-50">
                <strong>UPDATED AT:</strong>
                <div className="mt-1 text-slate-700">
                  {detailData.updated_at || "-"}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  openEditFromDetail();
                }}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Hapus
              </button>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailData(null);
                  setSelectedId(null);
                }}
                className="px-4 py-2 rounded-lg border"
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
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl animate-scale">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Edit2 className="w-5 h-5" /> Edit Gudang
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateWarehouse}
              className="grid grid-cols-2 gap-3"
            >
              <div className="col-span-2">
                <label className="text-xs text-slate-600">Nama Gudang</label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Kode</label>
                <input
                  value={editForm.code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, code: e.target.value })
                  }
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Tipe</label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                  className="input mt-1"
                >
                  <option value="main">Main</option>
                  <option value="branch">Branch</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600">Kota</label>
                <input
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Provinsi</label>
                <input
                  value={editForm.province}
                  onChange={(e) =>
                    setEditForm({ ...editForm, province: e.target.value })
                  }
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Kode Pos</label>
                <input
                  value={editForm.postal_code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, postal_code: e.target.value })
                  }
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Telepon</label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Email</label>
                <input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="input mt-1"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-600">Alamat Lengkap</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="input mt-1 h-24"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  disabled={busy}
                >
                  {busy ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============== DELETE CONFIRM =============== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-scale text-center">
            <h3 className="text-lg font-semibold mb-2">Hapus Gudang</h3>
            <p className="text-sm text-slate-600">
              Yakin ingin menghapus gudang <strong>{detailData?.name}</strong>?
              Tindakan ini tidak bisa dikembalikan.
            </p>

            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteWarehouse}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                disabled={busy}
              >
                {busy ? "Menghapus..." : "Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg z-60">
          {toast}
        </div>
      )}
    </div>
  );
}
