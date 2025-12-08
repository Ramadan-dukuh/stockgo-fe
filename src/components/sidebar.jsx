// components/Sidebar.js
import {
  LayoutDashboard,
  Warehouse,
  Boxes,
  Truck,
  Send,
  FileText,
  PackageSearch,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Sidebar({ open }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Menu berdasarkan role
  const getMenuItems = () => {
    const baseMenu = [
      { 
        icon: <LayoutDashboard size={20} />, 
        label: "Dashboard", 
        to: "/",
        roles: ['admin', 'dispatcher', 'petugas_gudang']
      },
    ];

    if (user?.role === 'admin') {
      // Admin: Semua akses
      return [
        ...baseMenu,
        { 
          icon: <Warehouse size={20} />, 
          label: "Data Gudang", 
          to: "/gudang",
          roles: ['admin', 'petugas_gudang']
        },
        { 
          icon: <Boxes size={20} />, 
          label: "Data Barang", 
          to: "/barang",
          roles: ['admin', 'petugas_gudang']
        },
        { 
          icon: <Truck size={20} />, 
          label: "Kurir", 
          to: "/kurir",
          roles: ['admin', 'dispatcher']
        },
        { 
          icon: <Send size={20} />, 
          label: "Pengiriman", 
          to: "/pengiriman",
          roles: ['admin', 'dispatcher']
        },
        { 
          icon: <PackageSearch size={20} />, 
          label: "Ekspedisi", 
          to: "/ekspedisi",
          roles: ['admin', 'dispatcher']
        },
        { 
          icon: <Users size={20} />, 
          label: "Pengguna", 
          to: "/users",
          roles: ['admin']
        },
        { 
          icon: <FileText size={20} />, 
          label: "Laporan", 
          to: "/laporan",
          roles: ['admin', 'dispatcher']
        },
        { 
          icon: <Settings size={20} />, 
          label: "Pengaturan", 
          to: "/settings",
          roles: ['admin']
        },
      ];
    } else if (user?.role === 'dispatcher') {
      // Dispatcher: Fokus pengiriman
      return [
        ...baseMenu,
        { 
          icon: <Truck size={20} />, 
          label: "Kurir", 
          to: "/kurir",
          roles: ['admin', 'dispatcher']
        },
        { 
          icon: <Send size={20} />, 
          label: "Pengiriman", 
          to: "/pengiriman",
          roles: ['admin', 'dispatcher']
        },
        { 
          icon: <PackageSearch size={20} />, 
          label: "Ekspedisi", 
          to: "/ekspedisi",
          roles: ['admin', 'dispatcher']
        },
        { 
          icon: <FileText size={20} />, 
          label: "Laporan", 
          to: "/laporan",
          roles: ['admin', 'dispatcher']
        },
      ];
    } else if (user?.role === 'petugas_gudang') {
      // Petugas Gudang: Fokus stok
      return [
        ...baseMenu,
        { 
          icon: <Warehouse size={20} />, 
          label: "Data Gudang", 
          to: "/gudang",
          roles: ['admin', 'petugas_gudang']
        },
        { 
          icon: <Boxes size={20} />, 
          label: "Data Barang", 
          to: "/barang",
          roles: ['admin', 'petugas_gudang']
        },
      ];
    }

    return baseMenu;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menu = getMenuItems().filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div
      className={`bg-[#1E88E5] text-white h-screen flex flex-col shadow-lg transition-all duration-300
      ${open ? "w-64" : "w-20"}
      fixed md:static z-50
      ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/30">
        <div className="flex items-center gap-2">
          {open ? (
            <div>
              <div className="text-2xl font-bold">Stockgo</div>
              <div className="text-xs opacity-80 mt-1">
                {user?.name} • {user?.role}
              </div>
            </div>
          ) : (
            <span className="text-center w-full text-2xl font-bold">SG</span>
          )}
        </div>
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

      {/* User Info & Logout */}
      <div className="border-t border-white/30">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full cursor-pointer hover:bg-white/20 transition
          ${open ? "px-6 gap-3" : "justify-center"} py-3`}
        >
          <LogOut size={20} />
          {open && <span>Logout</span>}
        </button>
        
        {open && user && (
          <div className="px-6 py-3 text-sm opacity-80 border-t border-white/30">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs mt-1">
              {user.role === 'admin' ? 'Administrator' :
               user.role === 'dispatcher' ? 'Dispatcher' :
               'Petugas Gudang'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;