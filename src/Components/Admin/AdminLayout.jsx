import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      {/* SIDEBAR */}
      <Sidebar navigate={navigate} mobileOpen={open} setMobileOpen={setOpen} />

      {/* MAIN WRAPPER */}
      <div
        className={`flex flex-col flex-1 transition-[margin] duration-300 ${isMobile ? "ml-0 overflow-x-hidden" : "ml-[260px]"}`}
      >
        {/* HEADER */}
        <header className="bg-[#faf9f5] text-black px-5 h-[60px] border-b border-[#dfd7d7] flex items-center relative">
          {/* Left area */}
          <div
            className={`flex items-center justify-start ${isMobile ? "w-1/3" : "w-auto"}`}
          >
            {isMobile && (
              <button
                onClick={() => setOpen(true)}
                className="bg-transparent border-none cursor-pointer flex items-center justify-center p-0 mr-[90px]"
              >
                <Menu size={28} color="#323232" />
              </button>
            )}
            {!isMobile && (
              <span className="font-bold text-[20px] whitespace-nowrap">
                Ask Sunnah Admin Panel
              </span>
            )}
          </div>

          {/* Centered title — mobile only */}
          {isMobile && (
            <div className="w-1/3 flex justify-center items-center font-bold whitespace-nowrap text-[18px] h-full">
              Ask Sunnah Admin Panel
            </div>
          )}

          {/* Right spacer */}
          <div className="w-1/3" />
        </header>

        {/* MAIN CONTENT */}
        <main className="p-5 max-w-[1100px]">{children}</main>
      </div>
    </div>
  );
}
