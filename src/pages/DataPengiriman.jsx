import React, { useState, useEffect } from "react";
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
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Phone,
  Mail,
  Building,
  Weight,
  DollarSign,
  Navigation,
  Info,
  ChevronDown,
  ChevronUp,
  Users,
  Check,
  Truck,
  MapPin as MapPinIcon,
  PhoneCall,
} from "lucide-react";

export default function DataPengiriman() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pengirimanData, setPengirimanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [deliveryItems, setDeliveryItems] = useState({});
  const [availableKurirs, setAvailableKurirs] = useState([]);
  const [loadingKurirs, setLoadingKurirs] = useState(false);
  const [selectedKurirId, setSelectedKurirId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [kurirStats, setKurirStats] = useState({});

  // State untuk form tambah pengiriman
  const [newDelivery, setNewDelivery] = useState({
    customer_id: "",
    warehouse_id: 1,
    pickup_address: "Gudang Utama",
    delivery_address: "",
    delivery_city: "",
    delivery_province: "",
    delivery_postal_code: "",
    notes: "",
    total_weight: "",
    total_value: "",
    items: [{ name: "", quantity: 1, unit_price: "", weight: 1, notes: "" }],
  });
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [addingDelivery, setAddingDelivery] = useState(false);

  // Fungsi untuk mendapatkan token dan user info
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return null;
    }

    // Decode token untuk mendapatkan role
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      setUserRole(decoded.role || "");
      return token;
    } catch (e) {
      console.error("Error decoding token:", e);
      return token;
    }
  };

  // Fetch data dari API
  useEffect(() => {
    fetchDeliveries();
    if (userRole === "admin" || userRole === "dispatcher") {
      fetchKurirStats();
    }
  }, [userRole]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) return;

      // Fetch deliveries dari API
      const res = await fetch(
        "http://localhost:3000/api/deliveries?page=1&limit=50",
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
        throw new Error(`Error ${res.status}: Gagal mengambil data pengiriman`);
      }

      const data = await res.json();
      console.log("Deliveries API Response:", data);

      if (data.success) {
        // Normalize data dari API
        const deliveries = data.data?.deliveries || data.data || [];
        const normalizedData = deliveries.map((item) => ({
          id: item.delivery?.id || item.id,
          tracking_number:
            item.delivery?.tracking_number ||
            item.tracking_number ||
            `DLV${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          customer_id: item.delivery?.customer_id || item.customer_id,
          warehouse_id: item.delivery?.warehouse_id || item.warehouse_id,
          kurir_id: item.delivery?.kurir_id || item.kurir_id,
          status: item.delivery?.status || item.status || "pending",
          pickup_address: item.delivery?.pickup_address || item.pickup_address,
          delivery_address:
            item.delivery?.delivery_address || item.delivery_address,
          delivery_city: item.delivery?.delivery_city || item.delivery_city,
          delivery_province:
            item.delivery?.delivery_province || item.delivery_province,
          delivery_postal_code:
            item.delivery?.delivery_postal_code || item.delivery_postal_code,
          notes: item.delivery?.notes || item.notes,
          total_weight: item.delivery?.total_weight || item.total_weight,
          total_value: item.delivery?.total_value || item.total_value,
          shipping_cost: item.delivery?.shipping_cost || item.shipping_cost,
          scheduled_pickup:
            item.delivery?.scheduled_pickup || item.scheduled_pickup,
          scheduled_delivery:
            item.delivery?.scheduled_delivery || item.scheduled_delivery,
          picked_up_at: item.delivery?.picked_up_at || item.picked_up_at,
          delivered_at: item.delivery?.delivered_at || item.delivered_at,
          created_by: item.delivery?.created_by || item.created_by,
          created_at: item.delivery?.created_at || item.created_at,
          updated_at: item.delivery?.updated_at || item.updated_at,

          // Customer data
          customer: item.customer || null,
          customer_name: item.customer?.name || "Unknown",
          customer_email: item.customer?.email,
          customer_phone: item.customer?.phone,
          customer_address: item.customer?.address,
          customer_city: item.customer?.city,
          customer_province: item.customer?.province,
          customer_postal_code: item.customer?.postal_code,

          // Kurir data
          kurir: item.kurir || null,
          kurir_name:
            item.kurir?.full_name ||
            item.kurir?.name ||
            item.kurir_name ||
            "Belum ditugaskan",
          kurir_phone: item.kurir?.phone,
          kurir_email: item.kurir?.email,
          kurir_rating: item.kurir?.rating || 0,
          kurir_status: item.kurir?.status || "unknown",

          // Display fields
          barang: "Loading items...",
          penerima: item.customer?.name || "Unknown",
          alamatTujuan: `${
            item.delivery?.delivery_address || "Unknown Address"
          }, ${item.delivery?.delivery_city || ""}, ${
            item.delivery?.delivery_province || ""
          }`,
          tanggal: item.delivery?.created_at
            ? new Date(item.delivery.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          estimasi: item.delivery?.scheduled_delivery
            ? new Date(item.delivery.scheduled_delivery)
                .toISOString()
                .split("T")[0]
            : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
          berat: item.delivery?.total_weight
            ? `${parseFloat(item.delivery.total_weight).toFixed(2)} kg`
            : "0.00 kg",
          nilai: item.delivery?.total_value
            ? `Rp ${parseFloat(item.delivery.total_value).toLocaleString(
                "id-ID"
              )}`
            : "Rp 0",

          rawData: item,
        }));

        setPengirimanData(normalizedData);

        // Fetch items untuk setiap delivery
        normalizedData.forEach((delivery) => {
          fetchDeliveryItems(delivery.id);
        });
      } else {
        setPengirimanData([]);
        setError(data.message || "Gagal mengambil data pengiriman");
      }
    } catch (err) {
      console.error("Fetch deliveries error:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data");
      setPengirimanData(getDummyData());
    } finally {
      setLoading(false);
    }
  };

  // Fetch kurir statistics
  const fetchKurirStats = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/kurirs", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.kurirs) {
          const stats = {
            total: data.data.kurirs.length,
            active: data.data.kurirs.filter((k) => k.kurir?.status === "active")
              .length,
            available: data.data.kurirs.filter(
              (k) => k.kurir?.status === "available"
            ).length,
            busy: data.data.kurirs.filter((k) => k.kurir?.status === "busy")
              .length,
            offline: data.data.kurirs.filter(
              (k) => k.kurir?.status === "offline"
            ).length,
          };
          setKurirStats(stats);
        }
      }
    } catch (err) {
      console.error("Fetch kurir stats error:", err);
    }
  };

  // Fetch items untuk delivery tertentu
  const fetchDeliveryItems = async (deliveryId) => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        `http://localhost:3000/api/deliveries/${deliveryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.items) {
          setDeliveryItems((prev) => ({
            ...prev,
            [deliveryId]: data.data.items,
          }));

          // Update barang display
          setPengirimanData((prev) =>
            prev.map((item) => {
              if (item.id === deliveryId) {
                const items = data.data.items;
                const barangNames = items
                  .map((item) => item.product?.name || "Unknown")
                  .join(", ");
                return {
                  ...item,
                  barang: items.length > 0 ? barangNames : "Tidak ada barang",
                  berat: `${items
                    .reduce(
                      (sum, item) =>
                        sum +
                        parseFloat(item.product?.weight || 0) *
                          (item.quantity || 1),
                      0
                    )
                    .toFixed(2)} kg`,
                  nilai: `Rp ${items
                    .reduce(
                      (sum, item) =>
                        sum +
                        parseFloat(item.unit_price || 0) * (item.quantity || 1),
                      0
                    )
                    .toLocaleString("id-ID")}`,
                };
              }
              return item;
            })
          );
        }
      }
    } catch (err) {
      console.error(`Fetch items for delivery ${deliveryId} error:`, err);
    }
  };

  // Fetch available kurirs dari endpoint /api/kurirs
  const fetchAvailableKurirs = async () => {
    try {
      setLoadingKurirs(true);
      const token = getToken();
      if (!token) return;

      // Gunakan endpoint berdasarkan struktur data kurir
      const response = await fetch(
        "http://localhost:3000/api/users?role=kurir",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Data kurirs response:", data);

        if (data.success && data.data?.users) {
          // Filter hanya kurir yang aktif
          const activeKurirs = data.data.users
            .filter((user) => user.is_active === true && user.role_id === 3) // role_id 3 biasanya untuk kurir
            .map((kurir) => ({
              id: kurir.id,
              name: kurir.full_name || kurir.name || `Kurir ${kurir.id}`,
              email: kurir.email,
              phone: kurir.phone,
              role_id: kurir.role_id,
              is_active: kurir.is_active,
              status: "available", // Default status
              rating: 4.5, // Default rating
              vehicle_type: "Motor", // Default vehicle
              license_plate: "B XXXXXX", // Default license
            }));

          setAvailableKurirs(activeKurirs);
          console.log("Available kurirs:", activeKurirs);
        } else {
          // Fallback jika struktur berbeda
          console.log("Menggunakan data kurir dari response berbeda");
          const alternativeKurirs = await tryAlternativeKurirEndpoints(token);
          setAvailableKurirs(alternativeKurirs);
        }
      } else {
        throw new Error("Gagal mengambil data kurir");
      }
    } catch (err) {
      console.error("Fetch kurirs error:", err);
      // Coba endpoint alternatif
      const token = getToken();
      if (token) {
        const alternativeKurirs = await tryAlternativeKurirEndpoints(token);
        setAvailableKurirs(alternativeKurirs);
      } else {
        setAvailableKurirs(getDummyKurirs());
      }
    } finally {
      setLoadingKurirs(false);
    }
  };

  // Fungsi untuk mencoba endpoint alternatif
  const tryAlternativeKurirEndpoints = async (token) => {
    const endpoints = [
      "http://localhost:3000/api/kurirs",
      "http://localhost:3000/api/deliveries/kurirs",
      "http://localhost:3000/api/staff/kurirs",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && (data.data?.kurirs || data.data?.users)) {
            const kurirs = data.data.kurirs || data.data.users;
            return kurirs.map((kurir) => ({
              id: kurir.user?.id || kurir.id || kurir.kurir?.user_id,
              name: kurir.user?.name || kurir.full_name || kurir.name,
              email: kurir.user?.email || kurir.email,
              phone: kurir.user?.phone || kurir.phone,
              status: kurir.kurir?.status || kurir.status || "available",
              rating: kurir.kurir?.rating || kurir.rating || 4.0,
              vehicle_type: kurir.kurir?.vehicle_type || "Motor",
              license_plate: kurir.kurir?.license_plate || "",
            }));
          }
        }
      } catch (err) {
        console.log(`Gagal dari ${endpoint}:`, err.message);
        continue;
      }
    }

    return getDummyKurirs();
  };

  // Fetch customers untuk form tambah pengiriman
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const token = getToken();
      if (!token) return;

      const response = await fetch("http://localhost:3000/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.customers) {
          setCustomers(data.data.customers);
        }
      }
    } catch (err) {
      console.error("Fetch customers error:", err);
      // Fallback to dummy customers
      setCustomers([
        {
          id: 1,
          name: "PT Toko Serba Ada",
          email: "toko@example.com",
          phone: "081234567895",
        },
        {
          id: 2,
          name: "CV Jaya Abadi",
          email: "jaya@example.com",
          phone: "081234567896",
        },
        {
          id: 3,
          name: "Toko Makmur Sejahtera",
          email: "makmur@example.com",
          phone: "081234567897",
        },
      ]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Data dummy kurir fallback
  const getDummyKurirs = () => [
    {
      id: 1,
      name: "Budi Santoso",
      phone: "081234567891",
      email: "budi@example.com",
      status: "available",
      rating: 4.5,
      current_location: "Jakarta Pusat",
      vehicle_type: "Motor",
      license_plate: "B 1234 ABC",
    },
    {
      id: 2,
      name: "Agus Wijaya",
      phone: "081234567892",
      email: "agus@example.com",
      status: "available",
      rating: 4.2,
      current_location: "Jakarta Selatan",
      vehicle_type: "Mobil Pickup",
      license_plate: "B 5678 DEF",
    },
    {
      id: 3,
      name: "Dewi Lestari",
      phone: "081234567893",
      email: "dewi@example.com",
      status: "busy",
      rating: 4.8,
      current_location: "Jakarta Barat",
      vehicle_type: "Motor",
      license_plate: "B 9012 GHI",
    },
    {
      id: 4,
      name: "Rudi Hartono",
      phone: "081234567894",
      email: "rudi@example.com",
      status: "available",
      rating: 4.0,
      current_location: "Jakarta Timur",
      vehicle_type: "Mobil Box",
      license_plate: "B 3456 JKL",
    },
  ];

  // Data dummy fallback untuk deliveries
  const getDummyData = () => [
    {
      id: 1,
      tracking_number: "DLV-001",
      customer_name: "PT Toko Serba Ada",
      customer_email: "toko@example.com",
      customer_phone: "081234567895",
      status: "pending",
      pickup_address: "Jl. Raya Jakarta No.123",
      delivery_address: "Jl. Sudirman No.45, Jakarta Pusat",
      delivery_city: "Jakarta",
      delivery_province: "DKI Jakarta",
      delivery_postal_code: "12190",
      notes: "Hati-hati, barang mudah pecah",
      total_weight: "5.50",
      total_value: "1500000.00",
      barang: "Laptop Dell XPS 13, Monitor 27 inch",
      penerima: "PT Toko Serba Ada",
      alamatTujuan: "Jl. Sudirman No.45, Jakarta Pusat, DKI Jakarta",
      kurir_name: "Belum ditugaskan",
      tanggal: "2025-12-08",
      estimasi: "2025-12-09",
      berat: "5.50 kg",
      nilai: "Rp 1,500,000",
      created_at: "2025-12-08T10:30:00Z",
    },
    {
      id: 2,
      tracking_number: "DLV-002",
      customer_name: "CV Jaya Abadi",
      customer_email: "jaya@example.com",
      customer_phone: "081234567896",
      status: "assigned",
      pickup_address: "Jl. Raya Jakarta No.123",
      delivery_address: "Jl. Gatot Subroto No.10, Jakarta Selatan",
      delivery_city: "Jakarta",
      delivery_province: "DKI Jakarta",
      delivery_postal_code: "12930",
      notes: null,
      total_weight: "3.20",
      total_value: "850000.00",
      barang: "Smartphone Samsung S24, Headphone Bluetooth",
      penerima: "CV Jaya Abadi",
      alamatTujuan: "Jl. Gatot Subroto No.10, Jakarta Selatan, DKI Jakarta",
      kurir_name: "Budi Santoso",
      kurir_phone: "081234567891",
      kurir_rating: 4.5,
      kurir_status: "active",
      tanggal: "2025-12-08",
      estimasi: "2025-12-09",
      berat: "3.20 kg",
      nilai: "Rp 850,000",
      created_at: "2025-12-08T09:15:00Z",
    },
    {
      id: 3,
      tracking_number: "DLV-003",
      customer_name: "Toko Makmur Sejahtera",
      customer_email: "makmur@example.com",
      customer_phone: "081234567897",
      status: "in_transit",
      pickup_address: "Jl. Raya Bandung No.456",
      delivery_address: "Jl. Ahmad Yani No.88, Bandung",
      delivery_city: "Bandung",
      delivery_province: "Jawa Barat",
      delivery_postal_code: "40124",
      notes: "Kirim sebelum jam 5 sore",
      total_weight: "2.00",
      total_value: "500000.00",
      barang: "Keyboard Mechanical, Mouse Gaming",
      penerima: "Toko Makmur Sejahtera",
      alamatTujuan: "Jl. Ahmad Yani No.88, Bandung, Jawa Barat",
      kurir_name: "Agus Wijaya",
      kurir_phone: "081234567892",
      kurir_rating: 4.2,
      kurir_status: "busy",
      tanggal: "2025-12-08",
      estimasi: "2025-12-09",
      berat: "2.00 kg",
      nilai: "Rp 500,000",
      created_at: "2025-12-08T08:45:00Z",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      assigned: "bg-blue-100 text-blue-700 border-blue-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      in_transit: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    const labels = {
      pending: "Menunggu",
      assigned: "Sudah Ditugaskan",
      processing: "Diproses",
      in_transit: "Dalam Pengiriman",
      delivered: "Terkirim",
      cancelled: "Dibatalkan",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
          styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getKurirStatusBadge = (status) => {
    const styles = {
      available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      active: "bg-blue-100 text-blue-700 border-blue-200",
      busy: "bg-amber-100 text-amber-700 border-amber-200",
      offline: "bg-red-100 text-red-700 border-red-200",
    };

    const labels = {
      available: "Tersedia",
      active: "Aktif",
      busy: "Sibuk",
      offline: "Offline",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
          styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailModal(true);
  };

  const handleAssignClick = (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedKurirId(delivery.kurir_id || "");
    fetchAvailableKurirs();
    setShowAssignModal(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!confirm(`Ubah status pengiriman ke "${newStatus}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/deliveries/${id}/status`,
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
        fetchDeliveries();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert(`Gagal memperbarui status: ${error.message}`);
    }
  };

  const handleAssignKurir = async () => {
    if (!selectedKurirId) {
      alert("Silakan pilih kurir terlebih dahulu");
      return;
    }

    if (
      !confirm(
        `Tugaskan kurir untuk pengiriman ${selectedDelivery.tracking_number}?`
      )
    )
      return;

    setAssigning(true);
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/deliveries/${selectedDelivery.id}/assign`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kurir_id: parseInt(selectedKurirId),
            status: "assigned", // Update status sekaligus
          }),
        }
      );

      if (response.ok) {
        alert("Kurir berhasil ditugaskan");
        setShowAssignModal(false);
        fetchDeliveries();
        fetchKurirStats();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal menugaskan kurir");
      }
    } catch (error) {
      console.error("Assign kurir error:", error);
      alert(`Gagal menugaskan kurir: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleCancelDelivery = async (id) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pengiriman ini?")) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/deliveries/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Pengiriman berhasil dibatalkan");
        fetchDeliveries();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Gagal membatalkan pengiriman");
      }
    } catch (error) {
      console.error("Cancel delivery error:", error);
      alert(`Gagal membatalkan pengiriman: ${error.message}`);
    }
  };

  // Fungsi untuk menambah pengiriman
  const handleAddDelivery = async () => {
    if (!newDelivery.customer_id) {
      alert("Silakan pilih customer");
      return;
    }

    if (!newDelivery.delivery_address) {
      alert("Alamat pengiriman wajib diisi");
      return;
    }

    const token = getToken();
    if (!token) return;

    setAddingDelivery(true);

    try {
      // Validasi items
      const validItems = newDelivery.items.filter(
        (item) => item.name && item.quantity > 0 && item.unit_price
      );

      if (validItems.length === 0) {
        alert("Minimal satu barang dengan informasi lengkap diperlukan");
        setAddingDelivery(false);
        return;
      }

      // Format data untuk API
      const deliveryData = {
        customer_id: parseInt(newDelivery.customer_id),
        warehouse_id: newDelivery.warehouse_id || 1,
        pickup_address: newDelivery.pickup_address || "Gudang Utama",
        delivery_address: newDelivery.delivery_address,
        delivery_city: newDelivery.delivery_city,
        delivery_province: newDelivery.delivery_province,
        delivery_postal_code: newDelivery.delivery_postal_code,
        notes: newDelivery.notes,
        total_weight: parseFloat(newDelivery.total_weight) || 0,
        total_value: parseFloat(newDelivery.total_value) || 0,
        status: "pending",
        items: validItems.map((item) => ({
          product_name: item.name,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
          notes: item.notes || "",
        })),
      };

      // Hitung total weight dan value jika belum diisi
      if (!newDelivery.total_weight || !newDelivery.total_value) {
        const totalWeight = validItems.reduce(
          (sum, item) =>
            sum + parseFloat(item.weight || 1) * parseInt(item.quantity),
          0
        );
        const totalValue = validItems.reduce(
          (sum, item) =>
            sum + parseFloat(item.unit_price) * parseInt(item.quantity),
          0
        );
        deliveryData.total_weight = totalWeight;
        deliveryData.total_value = totalValue;
      }

      const response = await fetch("http://localhost:3000/api/deliveries", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deliveryData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Pengiriman berhasil ditambahkan!");
        setShowAddModal(false);
        setNewDelivery({
          customer_id: "",
          warehouse_id: 1,
          pickup_address: "Gudang Utama",
          delivery_address: "",
          delivery_city: "",
          delivery_province: "",
          delivery_postal_code: "",
          notes: "",
          total_weight: "",
          total_value: "",
          items: [
            { name: "", quantity: 1, unit_price: "", weight: 1, notes: "" },
          ],
        });
        fetchDeliveries();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambah pengiriman");
      }
    } catch (error) {
      console.error("Add delivery error:", error);
      alert(`Gagal menambah pengiriman: ${error.message}`);
    } finally {
      setAddingDelivery(false);
    }
  };

  // Fungsi untuk menambah item barang
  const addItemField = () => {
    setNewDelivery((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", quantity: 1, unit_price: "", weight: 1, notes: "" },
      ],
    }));
  };

  // Fungsi untuk menghapus item barang
  const removeItemField = (index) => {
    setNewDelivery((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Fungsi untuk update item
  const updateItemField = (index, field, value) => {
    setNewDelivery((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Check if user can add deliveries (admin only)
  const canAddDelivery = () => {
    return userRole === "admin";
  };

  // Check if user can assign (admin or dispatcher)
  const canAssign = () => {
    return userRole === "admin" || userRole === "dispatcher";
  };

  // Filter data berdasarkan search dan status
  const filteredData = pengirimanData.filter((item) => {
    const matchesSearch =
      item.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kurir_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.delivery_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barang?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Stats cards data dengan data kurir
  const stats = [
    {
      label: "Total Pengiriman",
      value: pengirimanData.length,
      icon: <Send size={20} />,
      color: "blue",
      trend: `+${Math.floor(Math.random() * 15)}%`,
    },
    {
      label: "Menunggu Assign",
      value: pengirimanData.filter((p) => p.status === "pending" && !p.kurir_id)
        .length,
      icon: <Clock size={20} />,
      color: "amber",
      trend: "perlu ditugaskan",
    },
    {
      label: "Kurir Tersedia",
      value: kurirStats.available || 0,
      icon: <Truck size={20} />,
      color: "emerald",
      trend: `${kurirStats.total || 0} total kurir`,
    },
    {
      label: "Dalam Pengiriman",
      value: pengirimanData.filter((p) => p.status === "in_transit").length,
      icon: <TrendingUp size={20} />,
      color: "blue",
      trend: "aktif",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Data Pengiriman
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-600">Role:</span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    userRole === "admin"
                      ? "bg-red-100 text-red-700"
                      : userRole === "dispatcher"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {userRole === "admin"
                    ? "Administrator"
                    : userRole === "dispatcher"
                    ? "Dispatcher"
                    : userRole === "kurir"
                    ? "Kurir"
                    : userRole || "User"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={fetchDeliveries}
            disabled={loading}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <p className="text-slate-600 ml-14">
          Monitor dan kelola semua aktivitas pengiriman
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
              Daftar Pengiriman ({pengirimanData.length})
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
                  <option value="assigned">Sudah Ditugaskan</option>
                  <option value="processing">Diproses</option>
                  <option value="in_transit">Dalam Pengiriman</option>
                  <option value="delivered">Terkirim</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pengiriman, penerima, atau kota..."
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
                  onClick={() => {
                    if (userRole === "admin") {
                      fetchCustomers();
                      setShowAddModal(true);
                    } else {
                      alert("Hanya admin yang dapat menambah pengiriman baru");
                    }
                  }}
                  className="bg-white text-blue-700 px-5 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Tambah Pengiriman</span>
                  <span className="sm:hidden">Tambah</span>
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
              <p className="text-slate-600">Memuat data pengiriman...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center">
              <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Tidak ada pengiriman yang sesuai dengan filter"
                  : "Belum ada data pengiriman"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID Pengiriman
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Penerima & Barang
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tujuan & Kurir
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tanggal & Berat
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
                {filteredData.map((item, index) => (
                  <React.Fragment key={item.tracking_number || item.id}>
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
                              {item.tracking_number}
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
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-800">
                              {item.customer_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600 truncate max-w-xs">
                              {item.barang}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              {item.delivery_city}, {item.delivery_province}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="w-3 h-3 text-slate-400" />
                            <span
                              className={`text-xs ${
                                item.kurir_id
                                  ? "text-slate-700"
                                  : "text-red-500"
                              }`}
                            >
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
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">
                              {item.tanggal}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Weight className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {item.berat}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusBadge(item.status)}
                          <button
                            onClick={() => toggleRowExpand(item.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            {expandedRows[item.id] ? (
                              <>
                                <ChevronUp size={10} /> Sembunyikan Detail
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                            title="Detail Lengkap"
                          >
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>

                          {/* Edit Button - Only for admin */}
                          {userRole === "admin" && (
                            <button
                              onClick={() =>
                                (window.location.href = `/pengiriman/edit/${item.id}`)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          )}

                          {/* Assign Button - Only for admin/dispatcher */}
                          {canAssign() &&
                            item.status === "pending" &&
                            !item.kurir_id && (
                              <button
                                onClick={() => handleAssignClick(item)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 group"
                                title="Assign Kurir"
                              >
                                <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                            )}

                          {/* Cancel Button - Only for admin and for non-cancelled/delivered */}
                          {userRole === "admin" &&
                            item.status !== "cancelled" &&
                            item.status !== "delivered" && (
                              <button
                                onClick={() => handleCancelDelivery(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                                title="Batalkan"
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
                        <td colSpan="6" className="px-6 py-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                                <Info size={16} />
                                Detail Pengiriman: {item.tracking_number}
                              </h3>
                              <span className="text-xs text-blue-600">
                                Dibuat:{" "}
                                {new Date(item.created_at).toLocaleDateString(
                                  "id-ID"
                                )}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Customer Info */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                                  <User size={14} /> Penerima
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Nama:</strong> {item.customer_name}
                                  </p>
                                  {item.customer_phone && (
                                    <p className="flex items-center gap-1">
                                      <Phone size={12} /> {item.customer_phone}
                                    </p>
                                  )}
                                  {item.customer_email && (
                                    <p className="flex items-center gap-1">
                                      <Mail size={12} /> {item.customer_email}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Address Info */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                                  <MapPin size={14} /> Alamat
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Alamat:</strong>{" "}
                                    {item.delivery_address}
                                  </p>
                                  <p>
                                    <strong>Kota:</strong> {item.delivery_city}
                                  </p>
                                  <p>
                                    <strong>Provinsi:</strong>{" "}
                                    {item.delivery_province}
                                  </p>
                                  {item.delivery_postal_code && (
                                    <p>
                                      <strong>Kode Pos:</strong>{" "}
                                      {item.delivery_postal_code}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Package Info */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                                  <Package size={14} /> Paket
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p className="flex items-center gap-1">
                                    <Weight size={12} /> <strong>Berat:</strong>{" "}
                                    {item.berat}
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <DollarSign size={12} />{" "}
                                    <strong>Nilai:</strong> {item.nilai}
                                  </p>
                                  <p>
                                    <strong>Estimasi:</strong> {item.estimasi}
                                  </p>
                                </div>
                              </div>

                              {/* Kurir Info */}
                              <div className="bg-white p-3 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                                  <Navigation size={14} /> Kurir
                                </h4>
                                <div className="space-y-1 text-sm">
                                  {item.kurir_id ? (
                                    <>
                                      <p>
                                        <strong>Nama:</strong> {item.kurir_name}
                                      </p>
                                      {item.kurir_phone && (
                                        <p>
                                          <strong>Telepon:</strong>{" "}
                                          {item.kurir_phone}
                                        </p>
                                      )}
                                      {item.kurir_rating > 0 && (
                                        <p>
                                          <strong>Rating:</strong>{" "}
                                          <span className="text-amber-600">
                                            {item.kurir_rating}★
                                          </span>
                                        </p>
                                      )}
                                      {item.kurir_status && (
                                        <p>
                                          <strong>Status:</strong>{" "}
                                          {getKurirStatusBadge(
                                            item.kurir_status
                                          )}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-red-500">
                                      <strong>
                                        Belum ada kurir yang ditugaskan
                                      </strong>
                                    </p>
                                  )}
                                </div>
                                {canAssign() &&
                                  item.status === "pending" &&
                                  !item.kurir_id && (
                                    <div className="mt-3">
                                      <button
                                        onClick={() => handleAssignClick(item)}
                                        className="w-full px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 flex items-center justify-center gap-2"
                                      >
                                        <Users size={14} />
                                        Assign Kurir
                                      </button>
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Items List */}
                            {deliveryItems[item.id] &&
                              deliveryItems[item.id].length > 0 && (
                                <div className="bg-white p-3 rounded-lg border border-blue-100">
                                  <h4 className="font-medium text-slate-700 mb-2">
                                    Daftar Barang
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {deliveryItems[item.id].map(
                                      (deliveryItem, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-slate-50 p-2 rounded border"
                                        >
                                          <p className="font-medium text-sm">
                                            {deliveryItem.product?.name ||
                                              `Barang ${idx + 1}`}
                                          </p>
                                          <p className="text-xs text-slate-600">
                                            {deliveryItem.quantity} x Rp{" "}
                                            {parseFloat(
                                              deliveryItem.unit_price || 0
                                            ).toLocaleString("id-ID")}
                                          </p>
                                          {deliveryItem.notes && (
                                            <p className="text-xs text-slate-500 mt-1 italic">
                                              Catatan: {deliveryItem.notes}
                                            </p>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
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

      {/* Detail Modal */}
      {showDetailModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Detail Lengkap Pengiriman
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header dengan Tracking Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Tracking Number
                      </p>
                      <p className="text-2xl font-bold text-blue-800">
                        {selectedDelivery.tracking_number}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">Status:</span>
                        {getStatusBadge(selectedDelivery.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Dibuat pada</p>
                      <p className="font-medium">
                        {new Date(selectedDelivery.created_at).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informasi Customer */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <User size={18} /> Informasi Penerima
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">
                          Nama Perusahaan/Penerima
                        </p>
                        <p className="font-medium">
                          {selectedDelivery.customer_name}
                        </p>
                      </div>
                      {selectedDelivery.customer_email && (
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Email</p>
                            <p className="font-medium">
                              {selectedDelivery.customer_email}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedDelivery.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">Telepon</p>
                            <p className="font-medium">
                              {selectedDelivery.customer_phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alamat Pengiriman */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <MapPin size={18} /> Alamat Pengiriman
                    </h3>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {selectedDelivery.delivery_address}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Kota</p>
                          <p>{selectedDelivery.delivery_city}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Provinsi</p>
                          <p>{selectedDelivery.delivery_province}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Kode Pos</p>
                          <p>{selectedDelivery.delivery_postal_code || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Alamat Pickup</p>
                          <p className="truncate">
                            {selectedDelivery.pickup_address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Pengiriman */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Calendar size={18} /> Info Pengiriman
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Tanggal Kirim</p>
                        <p className="font-medium">
                          {selectedDelivery.tanggal}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">
                          Estimasi Sampai
                        </p>
                        <p className="font-medium">
                          {selectedDelivery.estimasi}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Kurir</p>
                        <p
                          className={`font-medium ${
                            selectedDelivery.kurir_id
                              ? "text-slate-800"
                              : "text-red-600"
                          }`}
                        >
                          {selectedDelivery.kurir_name}
                          {selectedDelivery.kurir_rating > 0 && (
                            <span className="text-amber-600 ml-2">
                              ({selectedDelivery.kurir_rating}★)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Gudang</p>
                        <p className="font-medium">
                          Gudang #{selectedDelivery.warehouse_id || "1"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detail Paket */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Package size={18} /> Detail Paket
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Berat</span>
                        <span className="font-medium">
                          {selectedDelivery.berat}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Nilai</span>
                        <span className="font-medium">
                          {selectedDelivery.nilai}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Biaya Pengiriman</span>
                        <span className="font-medium">
                          {selectedDelivery.shipping_cost
                            ? `Rp ${parseFloat(
                                selectedDelivery.shipping_cost
                              ).toLocaleString("id-ID")}`
                            : "Belum dihitung"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kurir Section */}
                <div className="bg-slate-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Navigation size={18} /> Informasi Kurir
                    </h3>
                    {canAssign() &&
                      selectedDelivery.status === "pending" &&
                      !selectedDelivery.kurir_id && (
                        <button
                          onClick={() => {
                            setShowDetailModal(false);
                            setTimeout(
                              () => handleAssignClick(selectedDelivery),
                              100
                            );
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                        >
                          <Users size={16} />
                          Assign Kurir
                        </button>
                      )}
                  </div>
                  {selectedDelivery.kurir_id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Nama Kurir</p>
                        <p className="font-medium">
                          {selectedDelivery.kurir_name}
                        </p>
                      </div>
                      {selectedDelivery.kurir_phone && (
                        <div>
                          <p className="text-sm text-slate-600">Telepon</p>
                          <p className="font-medium">
                            {selectedDelivery.kurir_phone}
                          </p>
                        </div>
                      )}
                      {selectedDelivery.kurir_status && (
                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <p>
                            {getKurirStatusBadge(selectedDelivery.kurir_status)}
                          </p>
                        </div>
                      )}
                      {selectedDelivery.kurir_rating > 0 && (
                        <div>
                          <p className="text-sm text-slate-600">Rating</p>
                          <div className="flex items-center">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                  {i < Math.floor(selectedDelivery.kurir_rating)
                                    ? "★"
                                    : "☆"}
                                </span>
                              ))}
                            </div>
                            <span className="ml-2 text-slate-700">
                              {selectedDelivery.kurir_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedDelivery.kurir_email && (
                        <div>
                          <p className="text-sm text-slate-600">Email</p>
                          <p className="font-medium">
                            {selectedDelivery.kurir_email}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-600 mb-2">
                        Belum ada kurir yang ditugaskan
                      </p>
                      {canAssign() && selectedDelivery.status === "pending" && (
                        <p className="text-sm text-amber-600">
                          Silakan assign kurir untuk melanjutkan pengiriman
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                {selectedDelivery.notes && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <FileText size={18} /> Catatan Khusus
                    </h3>
                    <div className="p-3 bg-white rounded border">
                      <p className="text-slate-700">{selectedDelivery.notes}</p>
                    </div>
                  </div>
                )}

                {/* Items Section */}
                {deliveryItems[selectedDelivery.id] &&
                  deliveryItems[selectedDelivery.id].length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-bold text-slate-800 mb-3">
                        Barang yang Dikirim
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                Nama Barang
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                SKU
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                Jumlah
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                Harga Satuan
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                Subtotal
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">
                                Catatan
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {deliveryItems[selectedDelivery.id].map(
                              (item, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-slate-200"
                                >
                                  <td className="px-4 py-3">
                                    {item.product?.name || `Barang ${idx + 1}`}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {item.product?.sku || "-"}
                                  </td>
                                  <td className="px-4 py-3">{item.quantity}</td>
                                  <td className="px-4 py-3">
                                    Rp{" "}
                                    {parseFloat(
                                      item.unit_price || 0
                                    ).toLocaleString("id-ID")}
                                  </td>
                                  <td className="px-4 py-3 font-medium">
                                    Rp{" "}
                                    {(
                                      parseFloat(item.unit_price || 0) *
                                      (item.quantity || 1)
                                    ).toLocaleString("id-ID")}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {item.notes || "-"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  {canAssign() &&
                    selectedDelivery.status === "pending" &&
                    !selectedDelivery.kurir_id && (
                      <button
                        onClick={() => handleAssignClick(selectedDelivery)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                      >
                        <Users size={16} />
                        Assign Kurir
                      </button>
                    )}
                  {selectedDelivery.kurir_id &&
                    selectedDelivery.status === "pending" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedDelivery.id, "assigned")
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Tandai Sudah Ditugaskan
                      </button>
                    )}
                  {selectedDelivery.kurir_id &&
                    selectedDelivery.status === "assigned" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedDelivery.id, "processing")
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Tandai Diproses
                      </button>
                    )}
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedDelivery.id, "in_transit")
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Tandai Dalam Pengiriman
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedDelivery.id, "delivered")
                    }
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Tandai Terkirim
                  </button>
                  {selectedDelivery.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelDelivery(selectedDelivery.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Batalkan Pengiriman
                    </button>
                  )}
                  <button
                    onClick={() =>
                      (window.location.href = `/pengiriman/edit/${selectedDelivery.id}`)
                    }
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Edit Pengiriman
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Kurir Modal */}
      {showAssignModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Assign Kurir
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  disabled={assigning}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Delivery Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Informasi Pengiriman
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Tracking:</strong>{" "}
                      {selectedDelivery.tracking_number}
                    </p>
                    <p>
                      <strong>Penerima:</strong>{" "}
                      {selectedDelivery.customer_name}
                    </p>
                    <p>
                      <strong>Tujuan:</strong> {selectedDelivery.delivery_city},{" "}
                      {selectedDelivery.delivery_province}
                    </p>
                    <p>
                      <strong>Barang:</strong> {selectedDelivery.barang}
                    </p>
                    <p>
                      <strong>Berat:</strong> {selectedDelivery.berat}
                    </p>
                  </div>
                </div>

                {/* Kurir Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Pilih Kurir{" "}
                    {availableKurirs.length > 0 &&
                      `(${availableKurirs.length} tersedia)`}
                  </label>

                  {loadingKurirs ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-slate-600">Memuat daftar kurir...</p>
                    </div>
                  ) : availableKurirs.length === 0 ? (
                    <div className="text-center py-4">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-600 mb-2">
                        Tidak ada kurir tersedia
                      </p>
                      <p className="text-xs text-amber-600">
                        Semua kurir sedang sibuk. Coba lagi nanti.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {availableKurirs.map((kurir) => (
                        <div
                          key={kurir.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedKurirId === kurir.id.toString()
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-slate-300 hover:border-blue-300 hover:shadow-sm"
                          }`}
                          onClick={() =>
                            setSelectedKurirId(kurir.id.toString())
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-800">
                                  {kurir.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  {kurir.rating > 0 && (
                                    <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded">
                                      <span className="text-amber-600 text-xs font-medium">
                                        {kurir.rating}★
                                      </span>
                                    </div>
                                  )}
                                  {getKurirStatusBadge(kurir.status)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                                {kurir.phone && (
                                  <div className="flex items-center gap-1">
                                    <PhoneCall size={10} />
                                    <span>{kurir.phone}</span>
                                  </div>
                                )}

                                {kurir.current_location && (
                                  <div className="flex items-center gap-1">
                                    <MapPinIcon size={10} />
                                    <span className="truncate">
                                      {kurir.current_location}
                                    </span>
                                  </div>
                                )}

                                {kurir.vehicle_type && (
                                  <div className="flex items-center gap-1">
                                    <Truck size={10} />
                                    <span>{kurir.vehicle_type}</span>
                                  </div>
                                )}

                                {kurir.email && (
                                  <div className="flex items-center gap-1 col-span-2">
                                    <Mail size={10} />
                                    <span className="truncate">
                                      {kurir.email}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {selectedKurirId === kurir.id.toString() && (
                              <div className="ml-3 p-1 bg-blue-600 rounded-full self-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex-1"
                    disabled={assigning}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAssignKurir}
                    disabled={
                      !selectedKurirId ||
                      assigning ||
                      availableKurirs.length === 0
                    }
                    className={`px-4 py-2 text-white rounded-lg flex-1 flex items-center justify-center gap-2 ${
                      !selectedKurirId ||
                      assigning ||
                      availableKurirs.length === 0
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menugaskan...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Assign Kurir
                      </>
                    )}
                  </button>
                </div>

                {/* Info Message */}
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> Hanya admin dan dispatcher yang dapat
                    menugaskan kurir. Setelah kurir ditugaskan, status
                    pengiriman akan otomatis berubah menjadi "assigned".
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Delivery Modal - Only for Admin */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Tambah Pengiriman Baru
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  disabled={addingDelivery}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pilih Customer *
                  </label>
                  {loadingCustomers ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memuat data customer...</span>
                    </div>
                  ) : (
                    <select
                      value={newDelivery.customer_id}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          customer_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Pilih Customer --</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Alamat Pengiriman *
                    </label>
                    <input
                      type="text"
                      value={newDelivery.delivery_address}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          delivery_address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jl. Contoh No. 123"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kota *
                    </label>
                    <input
                      type="text"
                      value={newDelivery.delivery_city}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          delivery_city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jakarta"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={newDelivery.delivery_province}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          delivery_province: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DKI Jakarta"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={newDelivery.delivery_postal_code}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          delivery_postal_code: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345"
                    />
                  </div>
                </div>

                {/* Pickup Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alamat Pickup
                  </label>
                  <input
                    type="text"
                    value={newDelivery.pickup_address}
                    onChange={(e) =>
                      setNewDelivery({
                        ...newDelivery,
                        pickup_address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gudang Utama"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={newDelivery.notes}
                    onChange={(e) =>
                      setNewDelivery({ ...newDelivery, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Contoh: Hati-hati barang mudah pecah, antar sebelum jam 5 sore, dll."
                  />
                </div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">
                      Daftar Barang
                    </h3>
                    <button
                      type="button"
                      onClick={addItemField}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      + Tambah Barang
                    </button>
                  </div>

                  {newDelivery.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 p-4 rounded-lg mb-3 border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-slate-700">
                          Barang #{index + 1}
                        </span>
                        {newDelivery.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemField(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Hapus
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-600 mb-1">
                            Nama Barang *
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItemField(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Contoh: Laptop Dell XPS 13"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Jumlah *
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemField(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Harga Satuan (Rp) *
                          </label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItemField(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="1500000"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            Berat per unit (kg)
                          </label>
                          <input
                            type="number"
                            value={item.weight}
                            onChange={(e) =>
                              updateItemField(
                                index,
                                "weight",
                                parseFloat(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="1"
                            step="0.01"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs text-slate-600 mb-1">
                            Catatan Barang (Opsional)
                          </label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) =>
                              updateItemField(index, "notes", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Contoh: Warna silver, garansi 1 tahun"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Ringkasan
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-600">Total Barang:</span>
                      <span className="ml-2 font-medium">
                        {newDelivery.items.filter((item) => item.name).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Estimasi Berat:</span>
                      <span className="ml-2 font-medium">
                        {newDelivery.items
                          .reduce(
                            (sum, item) =>
                              sum +
                              parseFloat(item.weight || 1) *
                                parseInt(item.quantity || 1),
                            0
                          )
                          .toFixed(2)}{" "}
                        kg
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-600">Total Nilai:</span>
                      <span className="ml-2 font-medium">
                        Rp{" "}
                        {newDelivery.items
                          .reduce(
                            (sum, item) =>
                              sum +
                              parseFloat(item.unit_price || 0) *
                                parseInt(item.quantity || 1),
                            0
                          )
                          .toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex-1"
                    disabled={addingDelivery}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddDelivery}
                    disabled={
                      !newDelivery.customer_id ||
                      !newDelivery.delivery_address ||
                      addingDelivery
                    }
                    className={`px-4 py-2 text-white rounded-lg flex-1 flex items-center justify-center gap-2 ${
                      !newDelivery.customer_id ||
                      !newDelivery.delivery_address ||
                      addingDelivery
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {addingDelivery ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menambah...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Tambah Pengiriman
                      </>
                    )}
                  </button>
                </div>

                {/* Info Message */}
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> Hanya admin yang dapat menambah
                    pengiriman baru. Pengiriman yang baru ditambahkan akan
                    berstatus "pending" dan perlu ditugaskan ke kurir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
