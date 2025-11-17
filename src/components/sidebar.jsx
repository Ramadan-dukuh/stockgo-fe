import {
  LayoutDashboard,
  Warehouse,
  Boxes,
  Truck,
  Send,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ open }) {
  const { pathname } = useLocation();

  const menu = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", to: "/" },
    { icon: <Warehouse size={20} />, label: "Data Gudang", to: "/gudang" },
    { icon: <Boxes size={20} />, label: "Data Barang", to: "/barang" },
    { icon: <Truck size={20} />, label: "Kurir", to: "/kurir" },
    { icon: <Send size={20} />, label: "Pengiriman", to: "/pengiriman" },
    { icon: <FileText size={20} />, label: "Laporan", to: "/laporan" },
  ];

  return (
    <div
      className={`bg-[#1E88E5] text-white h-screen flex flex-col shadow-lg transition-all duration-300
      ${open ? "w-64" : "w-20"}
      fixed md:static z-50
      ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* Header */}
      <div className="px-6 py-6 text-2xl font-bold border-b border-white/30 flex items-center gap-2">
        {open ? (
          <span>Stockgo</span>
        ) : (
          <span className="text-center w-full">SG</span>
        )}
      </div>

      {/* Menu */}
      <ul className="flex-1 mt-4 space-y-1">
        {menu.map((item, i) => (
          <li key={i}>
            <Link
              to={item.to}
              className={`flex items-center cursor-pointer hover:bg-white/20 transition rounded-r-full
              ${open ? "px-6 gap-3" : "justify-center"} py-3
              ${pathname === item.to ? "bg-white/30 font-semibold" : ""}`}
            >
              {item.icon}
              {open && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer */}
      {open && (
        <div className="px-6 py-4 border-t border-white/30 text-sm opacity-80">
          © 2025 Stockgo
        </div>
      )}
    </div>
  );
}

export default Sidebar;
