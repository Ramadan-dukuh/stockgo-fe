import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import Footer from "./footer";

function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detect
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpen(!mobile); // otomatis tutup di mobile, buka di desktop
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ESC close on mobile
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, open]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={open} />

      {/* Overlay (klik untuk menutup) mobile only */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggle={() => setOpen(!open)} />

        <div className="p-6 bg-gray-50 flex-1 overflow-auto">{children}</div>

        <Footer />
      </div>
    </div>
  );
}

export default Layout;
