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
} from "lucide-react";

function Dashboard() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // === STATE DATA API ===
  const [kurirData, setKurirData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);

  // === FETCH API ===
  useEffect(() => {
    async function fetchAll() {
      try {
        // Kurir
        const resKurir = await fetch(
          "http://localhost:3000/api/kurir?page=1&limit=10"
        );
        const jsonKurir = await resKurir.json();
        if (jsonKurir.success) setKurirData(jsonKurir.data.kurirs);

        // Products
        const resProducts = await fetch(
          "http://localhost:3000/api/products?page=1&limit=10"
        );
        const jsonProducts = await resProducts.json();
        if (jsonProducts.success) setProductData(jsonProducts.data.products);

        // Warehouses
        const resWarehouses = await fetch(
          "http://localhost:3000/api/warehouses?page=1&limit=10"
        );
        const jsonWarehouses = await resWarehouses.json();
        if (jsonWarehouses.success)
          setWarehouseData(jsonWarehouses.data.warehouses);
      } catch (error) {
        console.error("Gagal fetch:", error);
      }
    }

    fetchAll();
  }, []);

  // === CHART ===
  useEffect(() => {
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

    return () => chartInstance.current?.destroy();
  }, []);

  // === STAT CARDS DENGAN DATA API ===
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
      title: "Gudang Aktif",
      value: warehouseData.length,
      icon: <Warehouse size={24} />,
      change: "+2",
      bgColor: "bg-purple-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Pengiriman Aktif",
      value: 69,
      icon: <Send size={24} />,
      change: "+23%",
      bgColor: "bg-orange-500",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  // === DATA TABEL (SAMA) ===
  const recentDeliveries = [
    {
      id: "DLV-001",
      barang: "Laptop Dell XPS 13",
      tujuan: "Jakarta Pusat",
      kurir: "Budi Santoso",
      status: "progress",
    },
    {
      id: "DLV-002",
      barang: "Smartphone Samsung S24",
      tujuan: "Tangerang",
      kurir: "Andi Wijaya",
      status: "progress",
    },
    {
      id: "DLV-003",
      barang: "Monitor LG 27 inch",
      tujuan: "Bekasi",
      kurir: "Rudi Hartono",
      status: "delivered",
    },
    {
      id: "DLV-004",
      barang: "Keyboard Mechanical",
      tujuan: "Depok",
      kurir: "Siti Nurhaliza",
      status: "progress",
    },
    {
      id: "DLV-005",
      barang: "Mouse Gaming Logitech",
      tujuan: "Bogor",
      kurir: "Dewi Lestari",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Selamat datang kembali! 👋
            </h1>
            <p className="text-blue-100">
              Berikut ringkasan aktivitas pengiriman Anda hari ini
            </p>
          </div>

          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <span className="text-sm">Hari ini</span>
              </div>
              <p className="text-2xl font-bold">
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

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
            </div>
            <div className={`h-1 ${item.bgColor}`}></div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Aktivitas Pengiriman Mingguan
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Grafik pengiriman 5 hari terakhir
          </p>
        </div>
        <div className="p-6">
          <div style={{ height: "280px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="text-blue-600" size={24} />
            Pengiriman Terbaru
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Daftar pengiriman yang sedang aktif
          </p>
        </div>

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
                  Tujuan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Kurir
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {recentDeliveries.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-semibold">{item.id}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Package size={16} className="text-slate-400" />
                    <span>{item.barang}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{item.tujuan}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <span>{item.kurir}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
          <span>
            Menampilkan <span className="font-semibold text-slate-800">5</span>{" "}
            pengiriman terbaru
          </span>
          <button className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Lihat Semua →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
