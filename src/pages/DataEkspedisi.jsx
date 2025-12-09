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
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function DataEkspedisi() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [ekspedisiData, setEkspedisiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [kurirs, setKurirs] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedExpedition, setSelectedExpedition] = useState(null);
  const [expeditionItems, setExpeditionItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});

  // Form state untuk create expedition
  const [expeditionForm, setExpeditionForm] = useState({
    warehouse_id: "",
    kurir_id: "",
    departure_date: "",
    arrival_date: "",
    notes: "",
    delivery_ids: [],
  });

  // Form state untuk edit expedition
  const [editForm, setEditForm] = useState({
    warehouse_id: "",
    kurir_id: "",
    departure_date: "",
    arrival_date: "",
    notes: "",
    delivery_ids: [],
  });

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fungsi untuk mendapatkan token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return null;
    }
    return token;
  };

  // Fungsi untuk menampilkan notifikasi
  const showNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
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

      const res = await fetch("http://localhost:3000/api/expeditions?page=1&limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Tidak dapat terhubung ke server ekspedisi");
      }

      const data = await res.json();
      console.log("Expeditions API Response:", data);

      if (data.success && data.data?.expeditions) {
        const normalizedData = data.data.expeditions.map((item) => ({
          id: item.id,
          expedition_code: item.expedition_code,
          warehouse_id: item.warehouse_id,
          warehouse: item.warehouse || {},
          warehouse_name: item.warehouse?.name || "Gudang Tidak Diketahui",
          warehouse_location: `${item.warehouse?.city || ""}, ${item.warehouse?.province || ""}`,
          kurir_id: item.kurir_id,
          kurir: item.kurir || {},
          kurir_name: item.kurir?.user?.full_name || item.kurir?.user?.name || "Belum ditugaskan",
          kurir_vehicle: `${item.kurir?.vehicle_type || ""} ${item.kurir?.vehicle_plate || ""}`,
          kurir_rating: parseFloat(item.kurir?.rating) || 0,
          kurir_status: item.kurir?.status || "unknown",
          notes: item.notes,
          status: item.status,
          status_label: getStatusLabel(item.status),
          departure_date: item.departure_date,
          arrival_date: item.arrival_date,
          total_packages: item.total_packages || 0,
          total_weight: item.total_weight || "0",
          total_value: item.total_value || "0",
          created_by: item.created_by,
          creator: item.creator,
          creator_name: item.creator?.full_name || item.creator?.name || "System",
          created_at: item.created_at,
          updated_at: item.updated_at,
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
          tanggal_berangkat: item.departure_date
            ? new Date(item.departure_date).toLocaleDateString("id-ID")
            : "-",
          tanggal_tiba: item.arrival_date
            ? new Date(item.arrival_date).toLocaleDateString("id-ID")
            : "-",
          rawData: item,
        }));

        setEkspedisiData(normalizedData);

        // Fetch items untuk setiap ekspedisi
        normalizedData.forEach((expedition) => {
          fetchExpeditionItems(expedition.id);
        });
      } else {
        setEkspedisiData([]);
        showNotification("Data ekspedisi kosong", "warning");
      }
    } catch (err) {
      console.error("Fetch expeditions error:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      showNotification("Gagal mengambil data ekspedisi", "error");
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
        if (data.success && data.data?.warehouses) {
          setWarehouses(data.data.warehouses);
        }
      } else {
        showNotification("Gagal mengambil data gudang", "error");
      }
    } catch (err) {
      console.error("Fetch warehouses error:", err);
      showNotification("Error mengambil data gudang", "error");
    }
  };

  const fetchKurirs = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/kurir", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.kurirs) {
          // Filter hanya kurir yang available atau active
          const activeKurirs = data.data.kurirs.filter(
            (kurir) => kurir.status === "available" || kurir.status === "active"
          );
          setKurirs(activeKurirs);
        }
      } else {
        showNotification("Gagal mengambil data kurir", "error");
      }
    } catch (err) {
      console.error("Fetch kurirs error:", err);
      showNotification("Error mengambil data kurir", "error");
    }
  };

 const fetchAvailableDeliveries = async () => {
   try {
     const token = getToken();
     if (!token) return;
     console.log("Fetching available deliveries...");

     const res = await fetch(
       "http://localhost:3000/api/deliveries?status=pending&limit=100",
       {
         headers: {
           Authorization: `Bearer ${token}`,
           "Content-Type": "application/json",
         },
       }
     );

     const data = await res.json();
     console.log("Raw API Response:", data);

     if (data.success && data.data?.deliveries) {
       console.log("All deliveries:", data.data.deliveries);

       // FIX: Akses delivery yang nested
       const availableDeliveries = data.data.deliveries.filter((item) => {
         const deliveryData = item.delivery; // Ambil delivery dari nested object
         return (
           deliveryData &&
           !deliveryData.expedition_id &&
           deliveryData.status === "pending"
         );
       });

       console.log("Filtered available deliveries:", availableDeliveries);
       setDeliveries(availableDeliveries);
     }
   } catch (err) {
     console.error("Fetch available deliveries error:", err);
     showNotification("Error mengambil data pengiriman", "error");
   }
 };

  const fetchExpeditionItems = async (expeditionId) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [expeditionId]: true }));
      const token = getToken();
      if (!token) return;

      const res = await fetch(`http://localhost:3000/api/expeditions/${expeditionId}/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.items) {
          setExpeditionItems((prev) => ({
            ...prev,
            [expeditionId]: data.data.items,
          }));
        }
      }
    } catch (err) {
      console.error(`Fetch items for expedition ${expeditionId} error:`, err);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [expeditionId]: false }));
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
      draft: "Draft",
      completed: "Selesai",
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
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

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewDetails = (expedition) => {
    setSelectedExpedition(expedition);
    setShowDetailModal(true);
  };

  const handleEditClick = (expedition) => {
    setSelectedExpedition(expedition);
    // Populate edit form with current data
    setEditForm({
      warehouse_id: expedition.warehouse_id || "",
      kurir_id: expedition.kurir_id || "",
      departure_date: expedition.departure_date
        ? expedition.departure_date.split("T")[0]
        : "",
      arrival_date: expedition.arrival_date
        ? expedition.arrival_date.split("T")[0]
        : "",
      notes: expedition.notes || "",
      delivery_ids: expeditionItems[expedition.id]?.map((item) => item.delivery_id) || [],
    });
    setShowEditModal(true);
  };

  const handleCreateExpedition = async (e) => {
    e.preventDefault();

    // Validasi wajib
    if (!expeditionForm.warehouse_id) {
      showNotification("Pilih gudang terlebih dahulu", "error");
      return;
    }

    if (expeditionForm.delivery_ids.length === 0) {
      showNotification("Pilih minimal 1 pengiriman", "error");
      return;
    }

    const token = getToken();
    if (!token) return;

    setCreating(true);

    try {
      const requestData = {
        warehouse_id: parseInt(expeditionForm.warehouse_id),
        delivery_ids: expeditionForm.delivery_ids.map(id => parseInt(id)),
      };

      // Tambahkan optional fields jika ada
      if (expeditionForm.kurir_id) {
        requestData.kurir_id = parseInt(expeditionForm.kurir_id);
      }

      if (expeditionForm.notes) {
        requestData.notes = expeditionForm.notes;
      }

      if (expeditionForm.departure_date) {
        requestData.departure_date = new Date(expeditionForm.departure_date).toISOString();
      }

      if (expeditionForm.arrival_date) {
        requestData.arrival_date = new Date(expeditionForm.arrival_date).toISOString();
      }

      console.log("Creating expedition with data:", requestData);

      const response = await fetch("http://localhost:3000/api/expeditions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      console.log("API Response:", responseData);

      if (response.ok && responseData.success) {
        showNotification("Ekspedisi berhasil dibuat!", "success");
        setShowCreateModal(false);
        setExpeditionForm({
          warehouse_id: "",
          kurir_id: "",
          departure_date: "",
          arrival_date: "",
          notes: "",
          delivery_ids: [],
        });
        fetchExpeditions();
        fetchAvailableDeliveries();
      } else {
        throw new Error(
          responseData.message || `Gagal membuat ekspedisi (Status: ${response.status})`
        );
      }
    } catch (error) {
      console.error("Create expedition error:", error);
      showNotification(`Gagal membuat ekspedisi: ${error.message}`, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateExpedition = async (e) => {
    e.preventDefault();

    if (!selectedExpedition) return;

    const token = getToken();
    if (!token) return;

    setUpdating(true);

    try {
      const requestData = {};

      // Warehouse ID (wajib)
      if (editForm.warehouse_id) {
        requestData.warehouse_id = parseInt(editForm.warehouse_id);
      }

      // Kurir ID (opsional)
      if (editForm.kurir_id) {
        requestData.kurir_id = parseInt(editForm.kurir_id);
      } else {
        requestData.kurir_id = null;
      }

      // Notes
      if (editForm.notes !== undefined) {
        requestData.notes = editForm.notes || null;
      }

      // Dates
      if (editForm.departure_date) {
        requestData.departure_date = new Date(editForm.departure_date).toISOString();
      } else {
        requestData.departure_date = null;
      }

      if (editForm.arrival_date) {
        requestData.arrival_date = new Date(editForm.arrival_date).toISOString();
      } else {
        requestData.arrival_date = null;
      }

      console.log("Updating expedition with data:", requestData);

      const response = await fetch(
        `http://localhost:3000/api/expeditions/${selectedExpedition.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const responseData = await response.json();

      console.log("Update API Response:", responseData);

      if (response.ok && responseData.success) {
        showNotification("Ekspedisi berhasil diperbarui!", "success");
        setShowEditModal(false);
        fetchExpeditions();
      } else {
        throw new Error(
          responseData.message || `Gagal memperbarui ekspedisi (Status: ${response.status})`
        );
      }
    } catch (error) {
      console.error("Update expedition error:", error);
      showNotification(`Gagal memperbarui ekspedisi: ${error.message}`, "error");
    } finally {
      setUpdating(false);
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

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification("Status berhasil diperbarui", "success");
        fetchExpeditions();
      } else {
        throw new Error(
          data.message || data.error || "Gagal memperbarui status"
        );
      }
    } catch (error) {
      console.error("Update status error:", error);
      showNotification(`Gagal memperbarui status: ${error.message}`, "error");
    }
  };

  const handleDeleteExpedition = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ekspedisi ini?")) return;

    const token = getToken();
    if (!token) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/expeditions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification("Ekspedisi berhasil dihapus", "success");
        fetchExpeditions();
        fetchAvailableDeliveries();
      } else {
        throw new Error(
          data.message || data.error || "Gagal menghapus ekspedisi"
        );
      }
    } catch (error) {
      console.error("Delete expedition error:", error);
      showNotification(`Gagal menghapus ekspedisi: ${error.message}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Toggle delivery selection for create form
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

  // Add delivery item to expedition
  const handleAddDeliveryToExpedition = async (deliveryId) => {
    if (!selectedExpedition) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/expeditions/${selectedExpedition.id}/items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ delivery_id: parseInt(deliveryId) }),
        }
      );

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        showNotification(
          "Pengiriman berhasil ditambahkan ke ekspedisi",
          "success"
        );
        fetchExpeditionItems(selectedExpedition.id);
        fetchAvailableDeliveries();
      } else {
        throw new Error(
          responseData.message || "Gagal menambahkan pengiriman"
        );
      }
    } catch (error) {
      console.error("Add delivery to expedition error:", error);
      showNotification(
        `Gagal menambahkan pengiriman: ${error.message}`,
        "error"
      );
    }
  };

  // Remove delivery item from expedition
  const handleRemoveDeliveryFromExpedition = async (itemId) => {
    if (!selectedExpedition) return;

    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus pengiriman ini dari ekspedisi?"
      )
    )
      return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/expeditions/${selectedExpedition.id}/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        showNotification(
          "Pengiriman berhasil dihapus dari ekspedisi",
          "success"
        );
        fetchExpeditionItems(selectedExpedition.id);
        fetchAvailableDeliveries();
      } else {
        throw new Error(
          responseData.message || "Gagal menghapus pengiriman"
        );
      }
    } catch (error) {
      console.error("Remove delivery from expedition error:", error);
      showNotification(`Gagal menghapus pengiriman: ${error.message}`, "error");
    }
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
      value: ekspedisiData.filter(
        (p) => p.status === "delivered" || p.status === "completed"
      ).length,
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

  // Format currency
  const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount || 0).toLocaleString("id-ID")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : notification.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {notification.type === "success" && (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.type === "error" && <XCircle className="w-5 h-5" />}
            {notification.type === "warning" && (
              <AlertTriangle className="w-5 h-5" />
            )}
            {notification.type === "info" && (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Data Ekspedisi
              </h1>
            </div>
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
              <div className={`p-3 bg-blue-50 rounded-lg`}>
                <span className={`text-blue-600`}>{stat.icon}</span>
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
                  <option value="completed">Selesai</option>
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
                {/* Tombol Buat Ekspedisi - TAMPILKAN SELALU */}
                <button
                  onClick={() => {
                    setExpeditionForm({
                      warehouse_id: "",
                      kurir_id: "",
                      departure_date: "",
                      arrival_date: "",
                      notes: "",
                      delivery_ids: [],
                    });
                    setShowCreateModal(true);
                  }}
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
                    Ringkasan
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
                              {item.kurir_rating > 0 && (
                                <span className="text-amber-600 ml-1">
                                  ({item.kurir_rating}★)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-800">
                              {item.total_packages} paket
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileBarChart className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              {item.total_weight} kg •{" "}
                              {formatCurrency(item.total_value)}
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

                          {/* Edit Button - TAMPILKAN SELALU */}
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>

                          {/* Delete Button - Untuk status pending/draft */}
                          {(item.status === "pending" ||
                            item.status === "draft") && (
                            <button
                              onClick={() => handleDeleteExpedition(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          )}
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
                              {/* Notes & Dates */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2">
                                  Informasi
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {item.notes && (
                                    <div>
                                      <p className="text-slate-600 mb-1">
                                        Catatan:
                                      </p>
                                      <p className="text-slate-700 bg-slate-50 p-2 rounded">
                                        {item.notes}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-slate-600">
                                      Tanggal Berangkat:
                                    </p>
                                    <p>{item.tanggal_berangkat}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-600">
                                      Tanggal Tiba:
                                    </p>
                                    <p>{item.tanggal_tiba}</p>
                                  </div>
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
                                  <button
                                    onClick={() => handleEditClick(item)}
                                    className="w-full px-3 py-1 border border-blue-300 text-blue-600 rounded text-sm hover:bg-blue-50"
                                  >
                                    Edit Ekspedisi
                                  </button>
                                </div>
                              </div>

                              {/* Delivery Items */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-slate-700">
                                    Daftar Pengiriman ({item.total_packages})
                                  </h4>
                                  {loadingItems[item.id] && (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                  )}
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {expeditionItems[item.id]?.length > 0 ? (
                                    expeditionItems[item.id].map(
                                      (deliveryItem, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-slate-50 p-2 rounded border flex items-center justify-between"
                                        >
                                          <div>
                                            <p className="text-sm font-medium">
                                              {deliveryItem.delivery
                                                ?.tracking_number ||
                                                `Delivery ${idx + 1}`}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                              ID: {deliveryItem.delivery_id}
                                            </p>
                                          </div>
                                          {(item.status === "pending" ||
                                            item.status === "draft") && (
                                            <button
                                              onClick={() =>
                                                handleRemoveDeliveryFromExpedition(
                                                  deliveryItem.id
                                                )
                                              }
                                              className="text-red-600 hover:text-red-800 text-xs"
                                              title="Hapus dari ekspedisi"
                                            >
                                              <X size={12} />
                                            </button>
                                          )}
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p className="text-sm text-slate-400 text-center py-2">
                                      {loadingItems[item.id]
                                        ? "Memuat..."
                                        : "Belum ada data pengiriman"}
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
                  disabled={creating}
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
                          <option
                            key={warehouse.id}
                            value={warehouse.id}
                          >
                            {warehouse.name} - {warehouse.city},{" "}
                            {warehouse.province}
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
                          <option
                            key={kurir.id}
                            value={kurir.id}
                          >
                            {kurir.user?.full_name || kurir.user?.name}{" "}
                            - {kurir.vehicle_type || "No Vehicle"} (
                            {kurir.status || "unknown"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tanggal Berangkat (Opsional)
                      </label>
                      <input
                        type="date"
                        value={expeditionForm.departure_date}
                        onChange={(e) =>
                          setExpeditionForm((prev) => ({
                            ...prev,
                            departure_date: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tanggal Tiba (Opsional)
                      </label>
                      <input
                        type="date"
                        value={expeditionForm.arrival_date}
                        onChange={(e) =>
                          setExpeditionForm((prev) => ({
                            ...prev,
                            arrival_date: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">
                          Terpilih: {expeditionForm.delivery_ids.length}{" "}
                          pengiriman
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            // Select all deliveries
                            const allDeliveryIds = deliveries
                              .map((d) => d.id)
                              .filter((id) => id);
                            setExpeditionForm((prev) => ({
                              ...prev,
                              delivery_ids: allDeliveryIds,
                            }));
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Pilih Semua
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExpeditionForm((prev) => ({
                              ...prev,
                              delivery_ids: [],
                            }))
                          }
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto">
                      {deliveries.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                          <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p>Tidak ada pengiriman yang tersedia</p>
                          <p className="text-sm">
                            Semua pengiriman sudah masuk ekspedisi atau tidak
                            dalam status yang tepat
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {deliveries.map((delivery) => {
                            const deliveryId = delivery.id;

                            if (!deliveryId) return null;

                            return (
                              <div
                                key={deliveryId}
                                className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                                  expeditionForm.delivery_ids.includes(
                                    deliveryId
                                  )
                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                    : ""
                                }`}
                                onClick={() =>
                                  toggleDeliverySelection(deliveryId)
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                        expeditionForm.delivery_ids.includes(
                                          deliveryId
                                        )
                                          ? "bg-blue-500 border-blue-500 text-white"
                                          : "border-slate-300"
                                      }`}
                                    >
                                      {expeditionForm.delivery_ids.includes(
                                        deliveryId
                                      )
                                        ? "✓"
                                        : ""}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-800">
                                        {delivery.tracking_number ||
                                          `Delivery-${deliveryId}`}
                                      </p>
                                      <p className="text-sm text-slate-600">
                                        {delivery.customer?.name ||
                                          "Unknown Customer"}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {delivery.delivery_address ||
                                          "No address"}
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
                                      {formatCurrency(delivery.total_value)}
                                    </p>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${
                                        delivery.status === "pending"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {getStatusLabel(delivery.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {expeditionForm.delivery_ids.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-2">
                        Ringkasan Ekspedisi
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Total Pengiriman</p>
                          <p className="font-medium text-lg">
                            {expeditionForm.delivery_ids.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Estimasi Berat</p>
                          <p className="font-medium text-lg">
                            {deliveries
                              .filter((d) =>
                                expeditionForm.delivery_ids.includes(d.id)
                              )
                              .reduce(
                                (sum, d) => sum + parseFloat(d.total_weight || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            kg
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Estimasi Nilai</p>
                          <p className="font-medium text-lg">
                            {formatCurrency(
                              deliveries
                                .filter((d) =>
                                  expeditionForm.delivery_ids.includes(d.id)
                                )
                                .reduce(
                                  (sum, d) => sum + parseFloat(d.total_value || 0),
                                  0
                                )
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      disabled={creating}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={
                        expeditionForm.delivery_ids.length === 0 || creating
                      }
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Membuat...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Buat Ekspedisi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expedition Modal */}
      {showEditModal && selectedExpedition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Edit Ekspedisi: {selectedExpedition.expedition_code}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  disabled={updating}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateExpedition}>
                <div className="space-y-6">
                  {/* Expedition Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Gudang *
                      </label>
                      <select
                        value={editForm.warehouse_id}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            warehouse_id: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Gudang</option>
                        {warehouses.map((warehouse) => (
                          <option
                            key={warehouse.id}
                            value={warehouse.id}
                          >
                            {warehouse.name} - {warehouse.city},{" "}
                            {warehouse.province}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kurir (Opsional)
                      </label>
                      <select
                        value={editForm.kurir_id}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            kurir_id: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pilih Kurir</option>
                        {kurirs.map((kurir) => (
                          <option
                            key={kurir.id}
                            value={kurir.id}
                          >
                            {kurir.user?.full_name || kurir.user?.name}{" "}
                            - {kurir.vehicle_type || "No Vehicle"} (
                            {kurir.status || "unknown"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tanggal Berangkat (Opsional)
                      </label>
                      <input
                        type="date"
                        value={editForm.departure_date}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            departure_date: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tanggal Tiba (Opsional)
                      </label>
                      <input
                        type="date"
                        value={editForm.arrival_date}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            arrival_date: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Catatan untuk ekspedisi ini..."
                    />
                  </div>

                  {/* Current Delivery Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-slate-700">
                        Pengiriman dalam Ekspedisi (
                        {expeditionItems[selectedExpedition.id]?.length || 0})
                      </label>
                    </div>

                    <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto">
                      {expeditionItems[selectedExpedition.id]?.length > 0 ? (
                        <div className="divide-y divide-slate-200">
                          {expeditionItems[selectedExpedition.id].map(
                            (item, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-slate-50 hover:bg-slate-100"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {item.delivery?.tracking_number ||
                                        `Delivery ${idx + 1}`}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {item.delivery?.customer?.name ||
                                        "Unknown"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {item.delivery?.delivery_address}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(selectedExpedition.status === "pending" ||
                                      selectedExpedition.status ===
                                        "draft") && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveDeliveryFromExpedition(
                                            item.id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-800 text-sm"
                                        title="Hapus dari ekspedisi"
                                      >
                                        <X size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p>Belum ada pengiriman dalam ekspedisi ini</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Deliveries to Add */}
                  {(selectedExpedition.status === "pending" ||
                    selectedExpedition.status === "draft") && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Tambah Pengiriman Baru
                        </label>
                        <span className="text-sm text-slate-600">
                          {deliveries.length} pengiriman tersedia
                        </span>
                      </div>

                      <div className="border border-slate-300 rounded-lg max-h-64 overflow-y-auto">
                        {deliveries.length === 0 ? (
                          <div className="p-4 text-center text-slate-500">
                            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p>Tidak ada pengiriman yang tersedia</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {deliveries.map((delivery) => {
                              const deliveryId = delivery.id;

                              // Check if delivery is already in expedition
                              const isInExpedition = expeditionItems[
                                selectedExpedition.id
                              ]?.some(
                                (item) => item.delivery_id === deliveryId
                              );

                              if (isInExpedition || !deliveryId) return null;

                              return (
                                <div
                                  key={deliveryId}
                                  className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                  onClick={() =>
                                    handleAddDeliveryToExpedition(deliveryId)
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center">
                                        <Plus
                                          size={12}
                                          className="text-slate-400"
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-800">
                                          {delivery.tracking_number ||
                                            `Delivery-${deliveryId}`}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                          {delivery.customer?.name ||
                                            "Unknown"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {delivery.delivery_address ||
                                            "No address"}
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
                                        {formatCurrency(delivery.total_value)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      disabled={updating}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memperbarui...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delete Button */}
                  {(selectedExpedition.status === "pending" ||
                    selectedExpedition.status === "draft") && (
                    <div className="border-t pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteExpedition(selectedExpedition.id)
                        }
                        disabled={deleting}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Hapus Ekspedisi
                          </>
                        )}
                      </button>
                      <p className="text-xs text-red-600 mt-2 text-center">
                        Hati-hati: Aksi ini akan menghapus ekspedisi secara
                        permanen
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}