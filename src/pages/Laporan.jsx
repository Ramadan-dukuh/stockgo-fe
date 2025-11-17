import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Calendar,
  Filter,
  Download,
  TrendingUp,
  Package,
  Send,
  Warehouse,
  BarChart3,
  PieChart,
} from "lucide-react";
import Chart from "chart.js/auto";
import Layout from "../components/layout";

export default function Laporan() {
  const [jenisLaporan, setJenisLaporan] = useState("pengiriman");
  const [tanggalAwal, setTanggalAwal] = useState("2025-01-01");
  const [tanggalAkhir, setTanggalAkhir] = useState("2025-01-31");

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Data laporan berdasarkan periode
  const laporanData = {
    periode: [
      {
        minggu: "Minggu 1 (1-7 Jan)",
        total: 234,
        selesai: 222,
        proses: 9,
        gagal: 3,
        persentase: "94.9%",
      },
      {
        minggu: "Minggu 2 (8-14 Jan)",
        total: 245,
        selesai: 233,
        proses: 8,
        gagal: 4,
        persentase: "95.1%",
      },
      {
        minggu: "Minggu 3 (15-21 Jan)",
        total: 212,
        selesai: 201,
        proses: 6,
        gagal: 5,
        persentase: "94.8%",
      },
      {
        minggu: "Minggu 4 (22-28 Jan)",
        total: 256,
        selesai: 245,
        proses: 7,
        gagal: 4,
        persentase: "95.7%",
      },
      {
        minggu: "Minggu 5 (29-31 Jan)",
        total: 98,
        selesai: 92,
        proses: 4,
        gagal: 2,
        persentase: "93.9%",
      },
    ],
    summary: {
      totalPengiriman: 1045,
      berhasilTerkirim: 993,
      dalamProses: 34,
      gagal: 18,
      rataRataHarian: 34,
    },
  };

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: laporanData.periode.map(
          (p) => p.minggu.split(" ")[0] + " " + p.minggu.split(" ")[1]
        ),
        datasets: [
          {
            label: "Selesai",
            data: laporanData.periode.map((p) => p.selesai),
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderRadius: 8,
          },
          {
            label: "Dalam Proses",
            data: laporanData.periode.map((p) => p.proses),
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderRadius: 8,
          },
          {
            label: "Gagal",
            data: laporanData.periode.map((p) => p.gagal),
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12 },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 13, weight: "bold" },
            bodyFont: { size: 12 },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#64748b" },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { font: { size: 11 }, color: "#64748b" },
          },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, []);

  const stats = [
    {
      label: "Total Pengiriman",
      value: laporanData.summary.totalPengiriman,
      icon: <Send size={20} />,
      color: "blue",
    },
    {
      label: "Berhasil Terkirim",
      value: laporanData.summary.berhasilTerkirim,
      icon: <Package size={20} />,
      color: "emerald",
    },
    {
      label: "Dalam Proses",
      value: laporanData.summary.dalamProses,
      icon: <TrendingUp size={20} />,
      color: "amber",
    },
    {
      label: "Gagal/Dibatalkan",
      value: laporanData.summary.gagal,
      icon: <Warehouse size={20} />,
      color: "red",
    },
  ];

  return (
    
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Laporan</h1>
          </div>
          <p className="text-slate-600 ml-14">
            Analisis dan laporan aktivitas sistem pengiriman
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Jenis Laporan */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Jenis Laporan
              </label>
              <div className="relative">
                <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={jenisLaporan}
                  onChange={(e) => setJenisLaporan(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="pengiriman">Laporan Pengiriman</option>
                  <option value="kurir">Laporan Kurir</option>
                  <option value="barang">Laporan Barang</option>
                  <option value="gudang">Laporan Gudang</option>
                </select>
              </div>
            </div>

            {/* Tanggal Awal */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Awal
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tanggal Akhir */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Akhir
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Button */}
            <div className="flex items-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg">
                <Filter className="w-4 h-4" />
                Tampilkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                  <span className={`text-${stat.color}-600`}>{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 mb-6">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <PieChart className="text-blue-600" size={24} />
                  Grafik Laporan Periode
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Visualisasi data pengiriman per minggu
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div style={{ height: "300px" }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Ringkasan Laporan
              </h2>
              <button className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 shadow-md">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Selesai
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Proses
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Gagal
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Persentase Sukses
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {laporanData.periode.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-800">
                        {item.minggu}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-800">
                        {item.total}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-emerald-600">
                        {item.selesai}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {item.proses}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-red-600">
                        {item.gagal}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {item.persentase}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-800">
                      TOTAL
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-slate-800">
                      {laporanData.summary.totalPengiriman}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-emerald-600">
                      {laporanData.summary.berhasilTerkirim}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-blue-600">
                      {laporanData.summary.dalamProses}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-red-600">
                      {laporanData.summary.gagal}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      95.0%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Rata-rata pengiriman per hari:{" "}
              <span className="font-semibold text-slate-800">
                {laporanData.summary.rataRataHarian}
              </span>{" "}
              pengiriman
            </p>
          </div>
        </div>
      </div>
    
  );
}
