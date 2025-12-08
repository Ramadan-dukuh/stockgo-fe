import { Bell, Menu, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

function Navbar({ onToggle }) {
  const base_url = "http://localhost:3000"; // GANTI JIKA PERLU
  const token = localStorage.getItem("token");

  const [dropdown, setDropdown] = useState(false);
  const [user, setUser] = useState({
    full_name: "Loading...",
    role_name: "",
    avatar: "https://i.pravatar.cc/100",
  });

  // GET PROFILE FROM API  // ...existing code...
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          if (!token) {
            console.warn("No token found in localStorage");
            // optional: redirect to login
            // window.location.href = "/login";
            return;
          }
  
          const res = await fetch(`${base_url}/api/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            // jika backend mengandalkan cookie/session, uncomment:
            // credentials: "include",
          });
  
          if (res.status === 401) {
            console.warn("Unauthorized (401) when fetching profile");
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }
  
          const result = await res.json();
  
          if (result.success) {
            const data = result.data;
            setUser({
              full_name: data.full_name,
              role_name: data.role?.name || "User",
              avatar: "https://i.pravatar.cc/100",
            });
          } else {
            console.warn("Gagal mengambil profile:", result.message);
          }
        } catch (err) {
          console.error("Error fetch profile:", err);
        }
      };
  
      fetchProfile();
    }, []);
  // ...existing code...
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${base_url}/api/auth/profile`, {         
        headers: {
          Authorization: `Bearer ${token}`, // ✅ WAJIB INI
          "Content-Type": "application/json",
        },
      });        

        const result = await res.json();

        if (result.success) {
          const data = result.data;
          setUser({
            full_name: data.full_name,
            role_name: data.role?.name || "User",
            avatar: "https://i.pravatar.cc/100",
          });
        } else {
          console.warn("Gagal mengambil profile:", result.message);
        }
      } catch (err) {
        console.error("Error fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // LOGOUT  
    const handleLogout = () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    };  

  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6 relative z-40">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Menu
          onClick={onToggle}
          className="cursor-pointer text-gray-700 hover:text-gray-900 transition"
          size={26}
        />
        <h1 className="text-lg font-semibold text-gray-800 hidden md:block">
          Dashboard
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <Bell
          className="text-gray-600 cursor-pointer hover:text-gray-800 transition hidden md:block"
          size={22}
        />

        {/* Profile */}
        <div className="relative">
          <div
            onClick={() => setDropdown(!dropdown)}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <img
              src={user.avatar}
              alt="profile"
              className="w-10 h-10 rounded-full border group-hover:border-gray-400 transition"
            />

            <div className="text-gray-800 text-sm hidden md:block">
              <p className="font-semibold leading-tight">{user.full_name}</p>
              <p className="text-xs text-gray-500 -mt-1 capitalize">
                {user.role_name}
              </p>
            </div>

            <ChevronDown
              size={18}
              className={`text-gray-600 transition ${
                dropdown ? "rotate-180" : ""
              }`}
            />
          </div>

          {dropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-dropdown z-50">
              {/* Mobile only */}
              <div className="md:hidden px-4 py-2 border-b">
                <p className="font-semibold text-sm">{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role_name}
                </p>
              </div>

              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition">
                Lihat Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dropdown {
          0% { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-dropdown {
          animation: dropdown 0.18s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Navbar;
