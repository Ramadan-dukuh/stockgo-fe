import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  Users,
  Package,
  Warehouse,
  Send,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  RefreshCw,
  WifiOff,
} from "lucide-react";

function Dashboard() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // === STATE DATA API ===
  const [kurirData, setKurirData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");

  // Fungsi untuk mendapatkan token
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return null;
    }
    return token;
  };

  // === FETCH API ===
  useEffect(() => {
    fetchAll();
    // Setup chart setelah data selesai di-fetch
    const timer = setTimeout(setupChart, 1000);
    return () => {
      clearTimeout(timer);
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) return;

      let successCount = 0;
      const totalEndpoints = 3;

      // Kurir
      try {
        const resKurir = await fetch(
          "http://localhost:3000/api/kurir?page=1&limit=10",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (resKurir.ok) {
          const jsonKurir = await resKurir.json();
          if (jsonKurir.success) {
            setKurirData(jsonKurir.data?.kurirs || jsonKurir.data || []);
            successCount++;
          }
        } else if (resKurir.status === 404) {
          // Endpoint mungkin tidak ada, gunakan fallback
          console.log("Endpoint kurir tidak ditemukan, menggunakan data dummy");
          setKurirData(getDummyKurirData());
          successCount++;
        }
      } catch (err) {
        console.warn("Gagal fetch kurir:", err);
        setKurirData(getDummyKurirData());
      }

      // Products - coba beberapa endpoint
      try {
        // Coba endpoint utama dulu
        const endpoints = [
          "http://localhost:3000/api/products?page=1&limit=10",
          "http://localhost:3000/api/products",
          "http://localhost:3000/api/products/all",
        ];

        let productsSuccess = false;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (res.ok) {
              const json = await res.json();
              if (json.success) {
                const products =
                  json.data?.products || json.data || json.products || [];
                setProductData(Array.isArray(products) ? products : []);
                productsSuccess = true;
                successCount++;
                break;
              }
            }
          } catch (e) {
            continue; // Coba endpoint berikutnya
          }
        }

        if (!productsSuccess) {
          console.log("Semua endpoint produk gagal, menggunakan data dummy");
          setProductData(getDummyProductData());
          successCount++;
        }
      } catch (err) {
        console.warn("Gagal fetch products:", err);
        setProductData(getDummyProductData());
      }

      // Warehouses - PERBAIKAN DI SINI
      try {
        console.log("Mencoba fetch warehouses...");

        // Coba dengan Authorization header
        const resWarehouses = await fetch(
          "http://localhost:3000/api/warehouses?page=1&limit=10",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Warehouses response status:", resWarehouses.status);

        if (resWarehouses.ok) {
          const jsonWarehouses = await resWarehouses.json();
          console.log("✅ Warehouses API Response:", jsonWarehouses);

          if (jsonWarehouses.success) {
            // Handle berbagai struktur response
            let warehouses = [];

            if (
              jsonWarehouses.data?.warehouses &&
              Array.isArray(jsonWarehouses.data.warehouses)
            ) {
              warehouses = jsonWarehouses.data.warehouses;
            } else if (
              jsonWarehouses.data &&
              Array.isArray(jsonWarehouses.data)
            ) {
              warehouses = jsonWarehouses.data;
            } else if (
              jsonWarehouses.warehouses &&
              Array.isArray(jsonWarehouses.warehouses)
            ) {
              warehouses = jsonWarehouses.warehouses;
            } else if (Array.isArray(jsonWarehouses)) {
              warehouses = jsonWarehouses;
            }

            console.log(
              `✅ Berhasil mendapatkan ${warehouses.length} warehouses`
            );
            setWarehouseData(warehouses);
            successCount++;
          } else {
            console.warn("Warehouses API success: false", jsonWarehouses);
            setWarehouseData(getDummyWarehouseData());
            successCount++;
          }
        } else if (resWarehouses.status === 404) {
          console.log("Endpoint warehouses tidak ditemukan (404)");
          setWarehouseData(getDummyWarehouseData());
          successCount++;
        } else if (resWarehouses.status === 401) {
          console.log("Unauthorized (401) - Token mungkin tidak valid");
          setWarehouseData(getDummyWarehouseData());
          successCount++;
        } else {
          console.warn(`Warehouses API error: ${resWarehouses.status}`);
          setWarehouseData(getDummyWarehouseData());
          successCount++;
        }
      } catch (err) {
        console.warn("Gagal fetch warehouses:", err);
        setWarehouseData(getDummyWarehouseData());
        successCount++;
      }

      // Update backend status berdasarkan success rate
      if (successCount === totalEndpoints) {
        setBackendStatus("connected");
      } else if (successCount > 0) {
        setBackendStatus("partial");
      } else {
        setBackendStatus("disconnected");
        setError("Tidak dapat terhubung ke server backend");
      }
    } catch (error) {
      console.error("Gagal fetch data:", error);
      setError("Terjadi kesalahan saat mengambil data");
      setBackendStatus("disconnected");
      // Gunakan data dummy sebagai fallback
      setKurirData(getDummyKurirData());
      setProductData(getDummyProductData());
      setWarehouseData(getDummyWarehouseData());
    } finally {
      setLoading(false);
    }
  }

  // Setup chart
  const setupChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
        datasets: [
          {
            label: "Pengiriman",
            data: [12, 19, 15, 25, 8],
            backgroundColor: "rgba(37, 99, 235, 0.8)",
            borderRadius: 10,
            barThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14, weight: "bold" },
            bodyFont: { size: 13 },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 12 }, color: "#64748b" },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 12 }, color: "#64748b" },
          },
        },
      },
    });
  };

  // Data dummy untuk fallback
  const getDummyKurirData = () => [
    { id: 1, name: "Budi Santoso", status: "active", vehicle: "Motor" },
    { id: 2, name: "Andi Wijaya", status: "active", vehicle: "Mobil" },
    { id: 3, name: "Rudi Hartono", status: "inactive", vehicle: "Motor" },
    { id: 4, name: "Siti Nurhaliza", status: "active", vehicle: "Motor" },
    { id: 5, name: "Dewi Lestari", status: "active", vehicle: "Mobil" },
  ];

  const getDummyProductData = () => [
    {
      id: 1,
      name: "Laptop Dell XPS 13",
      sku: "LP-DELL-XPS13",
      status: "available",
    },
    {
      id: 2,
      name: "Smartphone Samsung S24",
      sku: "PH-SAMS-S24",
      status: "limited",
    },
    {
      id: 3,
      name: "Monitor LG 27 inch",
      sku: "MON-LG-27",
      status: "available",
    },
    {
      id: 4,
      name: "Keyboard Mechanical",
      sku: "KB-MECH-RED",
      status: "available",
    },
    {
      id: 5,
      name: "Mouse Gaming Logitech",
      sku: "MS-LOGI-GPRO",
      status: "out",
    },
    { id: 6, name: "Webcam HD", sku: "WC-HD-1080", status: "available" },
    {
      id: 7,
      name: "Headphone Bluetooth",
      sku: "HP-BT-SONY",
      status: "limited",
    },
    { id: 8, name: "SSD 1TB NVMe", sku: "SSD-1TB-NVME", status: "available" },
  ];

  const getDummyWarehouseData = () => [
    {
      id: 1,
      name: "Gudang Pusat Jakarta",
      location: "Jakarta Pusat",
      status: "active",
    },
    {
      id: 2,
      name: "Gudang Tangerang",
      location: "Tangerang",
      status: "active",
    },
    { id: 3, name: "Gudang Bekasi", location: "Bekasi", status: "inactive" },
    { id: 4, name: "Gudang Bandung", location: "Bandung", status: "active" },
  ];

  // === STAT CARDS DENGAN DATA API ===
  // PERBAIKAN: Count semua warehouse, tidak hanya yang aktif
  const stats = [
    {
      title: "Total Kurir",
      value: kurirData.length,
      icon: <Users size={24} />,
      change: "+12%",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total Barang",
      value: productData.length,
      icon: <Package size={24} />,
      change: "+8%",
      bgColor: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Total Gudang", // DIUBAH DARI "Gudang Aktif" KE "Total Gudang"
      value: warehouseData.length, // DIUBAH: Semua warehouse, tidak difilter
      icon: <Warehouse size={24} />,
      change: "+2",
      bgColor: "bg-purple-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Pengiriman Aktif",
      value: 69, // Static untuk sekarang
      icon: <Send size={24} />,
      change: "+23%",
      bgColor: "bg-orange-500",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  // Fungsi untuk menghitung gudang aktif (opsional, jika masih diperlukan)
  const getActiveWarehousesCount = () => {
    return warehouseData.filter(
      (w) => w.status === "active" || w.is_active === true
    ).length;
  };

  // === DATA TABEL ===
  const recentDeliveries = [
    {
      id: "DLV-001",
      barang: "Laptop Dell XPS 13",
      tujuan: "Jakarta Pusat",
      kurir: kurirData[0]?.name || "Budi Santoso",
      status: "progress",
    },
    {
      id: "DLV-002",
      barang: "Smartphone Samsung S24",
      tujuan: "Tangerang",
      kurir: kurirData[1]?.name || "Andi Wijaya",
      status: "progress",
    },
    {
      id: "DLV-003",
      barang: "Monitor LG 27 inch",
      tujuan: "Bekasi",
      kurir: kurirData[2]?.name || "Rudi Hartono",
      status: "delivered",
    },
    {
      id: "DLV-004",
      barang: "Keyboard Mechanical",
      tujuan: "Depok",
      kurir: kurirData[3]?.name || "Siti Nurhaliza",
      status: "progress",
    },
    {
      id: "DLV-005",
      barang: "Mouse Gaming Logitech",
      tujuan: "Bogor",
      kurir: kurirData[4]?.name || "Dewi Lestari",
      status: "pending",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      progress: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
    };
    const labels = {
      progress: "Dalam Pengiriman",
      delivered: "Terkirim",
      pending: "Menunggu",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const handleRefresh = () => {
    fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Memuat dashboard...</p>
          <p className="text-slate-500 text-sm mt-2">
            Menghubungkan ke server backend
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Selamat datang kembali! 👋
            </h1>
            <p className="text-blue-100">
              Berikut ringkasan aktivitas pengiriman Anda hari ini
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Date Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <span className="text-sm">Hari ini</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Refresh Button & Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                {backendStatus === "connected" ? (
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                ) : backendStatus === "partial" ? (
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                ) : (
                  <WifiOff size={14} className="text-red-300" />
                )}
                <span className="text-white text-sm">
                  {backendStatus === "connected"
                    ? "Online"
                    : backendStatus === "partial"
                    ? "Partial"
                    : "Offline"}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-white hover:text-blue-100 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">Peringatan</p>
              <p className="text-amber-700 text-sm mt-1">{error}</p>
              <p className="text-amber-600 text-xs mt-2">
                Menggunakan data simulasi untuk pengembangan
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-amber-600 hover:text-amber-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* DEBUG INFO - Untuk melihat data warehouse */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-700 font-medium">Data Warehouse</p>
            <p className="text-blue-600 text-sm">
              Total: {warehouseData.length} gudang
              {warehouseData.length > 0 && (
                <span className="ml-2">
                  (Aktif: {getActiveWarehousesCount()})
                </span>
              )}
            </p>
          </div>
          <div className="text-blue-500">
            <Warehouse size={20} />
          </div>
        </div>
      </div> */}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${item.lightBg} rounded-xl`}>
                  <span className={item.textColor}>{item.icon}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                  <ArrowUpRight size={16} />
                  {item.change}
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-1">{item.title}</p>
              <p className="text-3xl font-bold text-slate-800">{item.value}</p>
              {backendStatus !== "connected" && (
                <p className="text-xs text-slate-400 mt-2">
                  {item.value === 0 ? "Data kosong" : "Data simulasi"}
                </p>
              )}

              {/* Info tambahan untuk warehouse */}
              {/* {item.title === "Total Gudang" && warehouseData.length > 0 && (
                <p className="text-xs text-purple-500 mt-1">
                  {getActiveWarehousesCount()} aktif
                </p>
              )} */}
            </div>
            <div className={`h-1 ${item.bgColor}`}></div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                Aktivitas Pengiriman Mingguan
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Grafik pengiriman 5 hari terakhir
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-slate-600">Pengiriman</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div style={{ height: "280px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Send className="text-blue-600" size={24} />
                Pengiriman Terbaru
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Daftar pengiriman yang sedang aktif
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Total:{" "}
              <span className="font-semibold">{recentDeliveries.length}</span>{" "}
              pengiriman
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ID Pengiriman
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Barang
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tujuan
                </th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kurir
                </th>
                <th className="px-4 md:px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {recentDeliveries.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-sm font-semibold text-slate-800">
                      {item.id}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package
                        size={16}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700">
                        {item.barang}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={16}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700">
                        {item.tujuan}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users
                        size={16}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700">
                        {item.kurir}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-4 md:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            Menampilkan{" "}
            <span className="font-semibold text-slate-800">
              {recentDeliveries.length}
            </span>{" "}
            pengiriman terbaru
            {backendStatus !== "connected" && (
              <span className="text-amber-600 ml-2">(Data Simulasi)</span>
            )}
          </span>
          <button
            onClick={() => console.log("Navigasi ke halaman pengiriman")}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
          >
            Lihat Semua →
          </button>
        </div>
      </div>

      {/* Warehouse List (Optional) */}
      {/* {warehouseData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-purple-50 p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Warehouse className="text-purple-600" size={24} />
              Daftar Gudang ({warehouseData.length})
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Semua gudang yang terdaftar
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouseData.map((warehouse, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">
                      {warehouse.name || `Gudang ${index + 1}`}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        warehouse.status === "active" || warehouse.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {warehouse.status === "active" || warehouse.is_active
                        ? "Aktif"
                        : "Tidak Aktif"}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    {warehouse.location || "Lokasi tidak diketahui"}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    ID: {warehouse.id || index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default Dashboard;
