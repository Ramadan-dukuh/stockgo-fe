// pages/Unauthorized.js
import { ShieldAlert } from "lucide-react";

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Akses Ditolak
        </h1>
        <p className="text-slate-600 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Kembali
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
