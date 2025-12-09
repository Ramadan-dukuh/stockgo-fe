import { Bell, Menu, ChevronDown, User, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

function Navbar({ onToggle }) {
  const base_url = "http://localhost:3000"; // GANTI JIKA PERLU
  const token = localStorage.getItem("token");

  const [dropdown, setDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [user, setUser] = useState({
    full_name: "Loading...",
    role_name: "",
    avatar: "https://i.pravatar.cc/100",
    email: "",
    phone: "",
  });
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Fetch profile
  const fetchProfile = async () => {
    try {
      if (!token) {
        console.warn("No token found in localStorage");
        // Set default user data
        setUser({
          full_name: "Guest",
          role_name: "guest",
          avatar: "https://i.pravatar.cc/100",
          email: "",
          phone: "",
        });
        return;
      }

      const res = await fetch(`${base_url}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
          email: data.email || "",
          phone: data.phone || "",
        });
        setProfileForm({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } else {
        console.warn("Gagal mengambil profile:", result.message);
      }
    } catch (err) {
      console.error("Error fetch profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name || !profileForm.email) {
      alert("Nama lengkap dan email wajib diisi");
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await fetch(`${base_url}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          alert("Profile berhasil diperbarui");
          setEditingProfile(false);
          fetchProfile();
        } else {
          throw new Error(result.message || "Gagal memperbarui profile");
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memperbarui profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert(`Gagal memperbarui profile: ${error.message}`);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Open profile modal
  const openProfileModal = () => {
    setShowProfileModal(true);
    setEditingProfile(false);
    setShowChangePassword(false);
    setDropdown(false);
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      alert("Semua field password wajib diisi");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      alert("Password baru minimal 6 karakter");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${base_url}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          alert("Password berhasil diubah");
          setShowChangePassword(false);
          setPasswordForm({
            old_password: "",
            new_password: "",
            confirm_password: "",
          });
        } else {
          throw new Error(result.message || "Gagal mengubah password");
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengubah password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      alert(`Gagal mengubah password: ${error.message}`);
    } finally {
      setChangingPassword(false);
    }
  };

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

              <button
                onClick={openProfileModal}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
              >
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {showChangePassword ? "Ganti Password" : editingProfile ? "Edit Profile" : "Profile Saya"}
                </h2>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setEditingProfile(false);
                    setShowChangePassword(false);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  disabled={updatingProfile || changingPassword}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {showChangePassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password Lama *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, old_password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={changingPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password Baru *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={6}
                      disabled={changingPassword}
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Konfirmasi Password Baru *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={6}
                      disabled={changingPassword}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordForm({
                          old_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      disabled={changingPassword}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengubah...
                        </>
                      ) : (
                        "Ubah Password"
                      )}
                    </button>
                  </div>
                </form>
              ) : editingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, full_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={updatingProfile}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={updatingProfile}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updatingProfile}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false);
                        fetchProfile(); // Reset form
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      disabled={updatingProfile}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updatingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={user.avatar}
                      alt={user.full_name}
                      className="w-24 h-24 rounded-full border-4 border-blue-100 mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-slate-800">{user.full_name}</h3>
                    <p className="text-slate-600 capitalize">{user.role_name}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
                        Email
                      </label>
                      <p className="text-slate-800 font-medium">{user.email}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
                        Nomor Telepon
                      </label>
                      <p className="text-slate-800 font-medium">{user.phone || "-"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowProfileModal(false);
                        }}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                      >
                        Tutup
                      </button>
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Edit Profile
                      </button>
                    </div>
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="w-full px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
                    >
                      Ganti Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
