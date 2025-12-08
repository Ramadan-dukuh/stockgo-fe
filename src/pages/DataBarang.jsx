// DataBarang.jsx - PERBAIKAN FRONTEND SAJA
import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Box,
  Tag,
  Layers,
  X,
  AlertCircle,
  Loader2,
  Database,
  RefreshCw,
} from "lucide-react";

export default function DataBarang() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [barangData, setBarangData] = useState([]);
  const [kategoriList, setKategoriList] = useState(["all"]);
  const [kategoriMap, setKategoriMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [form, setForm] = useState({
    id: null,
    name: "",
    sku: "",
    category_id: "",
    unit: "",
    status: "available",
  });

  // Get token dengan validation
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token tidak ditemukan di localStorage");
      return null;
    }
    return token;
  };

  useEffect(() => {
    fetchData();
  }, [retryCount]);

  const fetchData = async () => {
    await Promise.all([fetchProducts(), fetchCategories()]);
  };

  // ✅ GET PRODUCTS dengan multiple fallback
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      console.log("Token yang digunakan:", token.substring(0, 20) + "...");

      // Coba endpoint dengan pagination terlebih dahulu
      let productsEndpoint =
        "http://localhost:3000/api/products?page=1&limit=100";
      let success = false;
      let productsData = [];

      // Priority 1: Endpoint dengan pagination
      try {
        console.log("Mencoba endpoint:", productsEndpoint);
        const res = await fetch(productsEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", res.status);

        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (res.ok) {
          const data = await res.json();
          console.log("Data dari endpoint pagination:", data);

          if (data.success) {
            // Handle berbagai struktur response
            if (data.data?.products && Array.isArray(data.data.products)) {
              productsData = data.data.products;
              success = true;
            } else if (Array.isArray(data.data)) {
              productsData = data.data;
              success = true;
            } else if (Array.isArray(data.products)) {
              productsData = data.products;
              success = true;
            }
          }
        }
      } catch (err) {
        console.log("Endpoint pagination error:", err.message);
      }

      // Priority 2: Endpoint tanpa pagination (fallback)
      if (!success) {
        try {
          const fallbackEndpoint = "http://localhost:3000/api/products/all";
          console.log("Mencoba fallback endpoint:", fallbackEndpoint);

          const res = await fetch(fallbackEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const data = await res.json();
            console.log("Data dari fallback endpoint:", data);

            if (data.success && data.data) {
              productsData = Array.isArray(data.data) ? data.data : [];
              success = true;
            }
          }
        } catch (err) {
          console.log("Fallback endpoint error:", err.message);
        }
      }

      // Priority 3: Endpoint alternatif tanpa auth (untuk testing)
      if (!success && retryCount > 0) {
        try {
          console.log("Mencoba endpoint tanpa auth (testing)");
          const testRes = await fetch(
            "http://localhost:3000/api/test/products"
          );
          if (testRes.ok) {
            const data = await testRes.json();
            productsData = Array.isArray(data) ? data : [];
            success = true;
          }
        } catch (err) {
          console.log("Test endpoint error:", err.message);
        }
      }

      if (success) {
        console.log("Berhasil mengambil", productsData.length, "produk");

        // Normalize data structure
        const normalizedData = productsData.map((item) => ({
          id: item.id || item.product_id,
          name: item.name || item.product_name,
          sku: item.sku || item.product_sku,
          category_id: item.category_id || item.category?.id,
          category: item.category || item.category_name,
          unit: item.unit || item.product_unit,
          status: item.status || "available",
          description: item.description,
          weight: item.weight,
          dimensions: item.dimensions,
          image_url: item.image_url,
        }));

        setBarangData(normalizedData);
      } else {
        setBarangData([]);
        setError(
          "Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi nanti."
        );
      }
    } catch (err) {
      console.error("FETCH PRODUCT ERROR:", err);
      setError(`Gagal memuat data: ${err.message}`);
      setBarangData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET CATEGORIES dengan multiple fallback
  const fetchCategories = async () => {
    try {
      const token = getToken();
      if (!token) return;

      let categoriesEndpoint = "http://localhost:3000/api/products/categories";
      let success = false;
      let categoriesData = [];

      // Priority 1: Endpoint utama
      try {
        const res = await fetch(categoriesEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Categories response:", data);

          if (data.success) {
            if (data.data?.categories && Array.isArray(data.data.categories)) {
              categoriesData = data.data.categories;
              success = true;
            } else if (data.data && Array.isArray(data.data)) {
              categoriesData = data.data;
              success = true;
            }
          }
        }
      } catch (err) {
        console.log("Categories endpoint error:", err.message);
      }

      // Priority 2: Endpoint alternatif
      if (!success) {
        try {
          const altRes = await fetch("http://localhost:3000/api/categories", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (altRes.ok) {
            const data = await altRes.json();
            if (data.success && data.data) {
              categoriesData = Array.isArray(data.data) ? data.data : [];
              success = true;
            }
          }
        } catch (err) {
          console.log("Alternative categories endpoint error:", err.message);
        }
      }

      if (success) {
        const map = {};
        categoriesData.forEach((c) => {
          const id = c.id || c.category_id;
          const name = c.name || c.category_name;
          if (id && name) {
            map[id] = name;
          }
        });

        setKategoriMap(map);
        setKategoriList([
          "all",
          ...categoriesData
            .map((c) => c.name || c.category_name)
            .filter(Boolean),
        ]);
      }
    } catch (err) {
      console.error("FETCH CATEGORY ERROR:", err);
    }
  };

  // ✅ INPUT FORM
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ OPEN TAMBAH
  const openTambah = () => {
    setIsEdit(false);
    setForm({
      id: null,
      name: "",
      sku: "",
      category_id: "",
      unit: "",
      status: "available",
    });
    setShowModal(true);
  };

  // ✅ OPEN EDIT
  const openEdit = (barang) => {
    setIsEdit(true);
    setForm({
      id: barang.id,
      name: barang.name,
      sku: barang.sku,
      category_id: barang.category_id || "",
      unit: barang.unit || "",
      status: barang.status || "available",
    });
    setShowModal(true);
  };

  // ✅ SUBMIT TAMBAH / EDIT dengan error handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form
    if (!form.name.trim()) {
      alert("Nama barang harus diisi");
      return;
    }

    if (!form.sku.trim()) {
      alert("SKU harus diisi");
      return;
    }

    if (!form.category_id) {
      alert("Kategori harus dipilih");
      return;
    }

    setSubmitting(true);
    const token = getToken();

    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      setSubmitting(false);
      return;
    }

    try {
      const url = isEdit
        ? `http://localhost:3000/api/products/${form.id}`
        : `http://localhost:3000/api/products`;

      const method = isEdit ? "PUT" : "POST";

      const bodyData = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category_id: parseInt(form.category_id),
        unit: form.unit.trim() || "pcs",
        status: form.status,
      };

      console.log("Submitting data:", bodyData);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      console.log("Submit response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `Gagal menyimpan data (${response.status})`
        );
      }

      if (!data.success) {
        throw new Error(data.message || "Gagal menyimpan data");
      }

      alert(data.message || "Data berhasil disimpan");
      setShowModal(false);
      fetchProducts(); // Refresh data
    } catch (error) {
      console.error("SUBMIT ERROR:", error);
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ DELETE dengan confirm
  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus barang ini?")) return;

    const token = getToken();
    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Delete response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `Gagal menghapus data (${response.status})`
        );
      }

      if (!data.success) {
        throw new Error(data.message || "Gagal menghapus data");
      }

      alert(data.message || "Barang berhasil dihapus");
      fetchProducts(); // Refresh data
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  // ✅ STATS
  const stats = [
    {
      label: "Total Barang",
      value: barangData.length,
      icon: <Package size={20} />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Stok Tersedia",
      value: barangData.filter((b) => b.status === "available").length,
      icon: <Box size={20} />,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Stok Terbatas",
      value: barangData.filter((b) => b.status === "limited").length,
      icon: <Layers size={20} />,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Stok Habis",
      value: barangData.filter((b) => b.status === "out").length,
      icon: <Tag size={20} />,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  // Filter barang berdasarkan search dan kategori
  const filteredBarang = barangData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (item.name?.toLowerCase() || "").includes(searchLower) ||
      (item.sku?.toLowerCase() || "").includes(searchLower);

    const categoryName = kategoriMap[item.category_id] || item.category;
    const matchesKategori =
      filterKategori === "all" || categoryName === filterKategori;

    return matchesSearch && matchesKategori;
  });

  // Format status
  const formatStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "Tersedia";
      case "limited":
        return "Terbatas";
      case "out":
        return "Habis";
      default:
        return status || "Unknown";
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   window.location.href = "/login";
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Data Barang
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            {/* <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Logout
            </button> */}
          </div>
        </div>
        <p className="text-slate-600 ml-14">
          Kelola inventori dan stok barang Anda
        </p>
      </div>

      {/* DEBUG INFO */}
      {/* <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <div className="flex items-center gap-2 text-blue-700">
          <Database className="w-4 h-4" />
          <span>Status: {loading ? "Memuat..." : "Siap"}</span>
          <span className="mx-2">•</span>
          <span>Token: {getToken() ? "✅ Ada" : "❌ Tidak ada"}</span>
          <span className="mx-2">•</span>
          <span>Barang: {barangData.length} item</span>
        </div>
      </div> */}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-600 font-medium">Error Loading Data</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <span className={stat.textColor}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header dengan Filter */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              Daftar Barang
              <span className="text-blue-200 ml-2 font-normal">
                ({filteredBarang.length} dari {barangData.length})
              </span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter Kategori */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="all">Semua Kategori</option>
                  {kategoriList
                    .filter((k) => k !== "all")
                    .map((k, index) => (
                      <option key={index} value={k}>
                        {k}
                      </option>
                    ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Cari barang atau SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Add Button */}
              <button
                onClick={openTambah}
                className="bg-white hover:bg-slate-50 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Tambah Barang</span>
                <span className="sm:hidden">Tambah</span>
              </button>
            </div>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600">Memuat data barang...</p>
              <p className="text-slate-500 text-sm mt-1">
                Memuat data dari server
              </p>
            </div>
          ) : filteredBarang.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">
                {searchTerm || filterKategori !== "all"
                  ? "Tidak ada barang yang sesuai dengan filter"
                  : barangData.length === 0
                  ? "Belum ada data barang"
                  : "Tidak ada barang yang cocok dengan pencarian"}
              </p>
              <div className="flex gap-3 justify-center mt-4">
                {searchTerm || filterKategori !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterKategori("all");
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-lg"
                  >
                    Reset Filter
                  </button>
                ) : (
                  barangData.length === 0 && (
                    <button
                      onClick={openTambah}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Tambah Barang Pertama
                    </button>
                  )
                )}
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="p-4 font-semibold text-slate-700">SKU</th>
                    <th className="p-4 font-semibold text-slate-700">
                      Nama Barang
                    </th>
                    <th className="p-4 font-semibold text-slate-700">
                      Kategori
                    </th>
                    <th className="p-4 font-semibold text-slate-700">Unit</th>
                    <th className="p-4 font-semibold text-slate-700">Status</th>
                    <th className="p-4 font-semibold text-slate-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBarang.map((barang) => {
                    const categoryName =
                      kategoriMap[barang.category_id] || barang.category;
                    return (
                      <tr
                        key={barang.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">
                            {barang.sku || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-800">
                          {barang.name || "N/A"}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {categoryName || "-"}
                          </span>
                        </td>
                        <td className="p-4">{barang.unit || "pcs"}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              barang.status === "available"
                                ? "bg-emerald-50 text-emerald-700"
                                : barang.status === "limited"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {formatStatus(barang.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(barang)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(barang.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Menampilkan {filteredBarang.length} dari {barangData.length}{" "}
                  barang
                </div>
                <div className="text-sm text-slate-500">
                  Terakhir diperbarui: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit ? "Edit Barang" : "Tambah Barang Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={submitting}
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Barang *
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Contoh: Laptop Dell XPS 15"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SKU *
                  </label>
                  <input
                    name="sku"
                    type="text"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Contoh: LP-DELL-XPS15"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  >
                    <option value="">Pilih Kategori</option>
                    {Object.entries(kategoriMap).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit
                  </label>
                  <input
                    name="unit"
                    type="text"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="Contoh: pcs, box, kg"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  >
                    <option value="available">Tersedia</option>
                    <option value="limited">Terbatas</option>
                    <option value="out">Habis</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
