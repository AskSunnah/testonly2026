import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Files,
  BookPlus,
  Library,
  LogOut,
  MessageSquare,
  X,
  ArrowUpRight,
  MessageCircleHeart,
  Flag,
  Pin,
  PenLine,
  ChartBarStacked,
  Users,
} from "lucide-react";

const MENU_TOP = [{ label: "Dashboard", icon: Home, route: "/dashboard" }];
const QUESTION_MENU = [
  {
    label: "User Questions",
    icon: MessageSquare,
    route: "/user-questions",
  },
  { label: "All Q&As", icon: Files, route: "/all-qa" },
  {
    label: "Add Extra Q&A",
    icon: PenLine,
    route: "/add-qa-standalone",
    exact: true,
  },
  {
    label: "Manage Categories",
    icon: ChartBarStacked,
    route: "/qa-categories",
  },
  {
    label: "Pinned section",
    icon: Pin,
    route: "/pinned-section",
  },
];
const BOOK_MENU = [
  { label: "Add Book", icon: BookPlus, route: "/add-book" },
  {
    label: "English Books",
    icon: Library,
    route: "/books/en",
    alsoActive: ["/books/edit/en"],
  },
  {
    label: "Arabic Books",
    icon: Library,
    route: "/books/ar",
    alsoActive: ["/books/edit/ar"],
  },
  {
    label: "Manage Authors",
    icon: Users,
    route: "/books/authors",
  },
];

const MENU_BOTTOM = [
  {
    label: "User Feedback",
    icon: MessageCircleHeart,
    route: "/user-feedback",
  },
  { label: "Reports", icon: Flag, route: "/reports" },
];

function SidebarLink({ item, pathname, onClick }) {
  const { label, icon: Icon, route, exact, alsoActive = [] } = item;

  const isActive = exact
    ? pathname === route
    : pathname.startsWith(route) ||
      alsoActive.some((activePath) => pathname.startsWith(activePath));

  return (
    <NavLink
      to={route}
      onClick={onClick}
      className={`
        flex items-center gap-[10px]
        px-5 py-3 mx-[6px] rounded-lg
        no-underline font-medium text-[0.92rem]
        transition-all duration-200
        ${
          isActive
            ? "bg-[#c3a421] text-white font-semibold"
            : "bg-transparent text-[#323232] hover:bg-[#f0ece0]"
        }
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ navigate, mobileOpen, setMobileOpen }) {
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("", { replace: true });
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-black/40 z-[98]"
        />
      )}

      <div
        className={`
          w-[260px] bg-[#faf9f5] text-[#323232]
          flex flex-col h-full
          fixed top-0 z-[99]
          border-r border-[#dfd7d7]
          transition-[left] duration-300
          overflow-hidden
          ${mobileOpen ? "left-0" : isMobile ? "left-[-260px]" : "left-0"}
        `}
        style={{ paddingTop: "2px" }}
      >
        <div className="px-5 h-[60px] flex items-center justify-between border-b border-[#dfd7d7] shrink-0">
          <h1 className="text-[1.1rem] font-bold m-0 leading-none flex items-center text-[#323232]">
            Ask Sunnah
          </h1>

          <div className="flex items-center gap-2">
            <a
              href="https://asksunnah.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-md border border-[#dfd7d7] text-[#323232] hover:bg-[#f0ece0] transition-colors duration-200"
              title="Visit asksunnah.com"
            >
              <ArrowUpRight size={20} />
            </a>

            {isMobile && (
              <button
                onClick={closeMobileMenu}
                className="bg-transparent border-none cursor-pointer flex items-center justify-end h-full p-0"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto mt-[10px] pb-[80px]">
          {MENU_TOP.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              pathname={pathname}
              onClick={closeMobileMenu}
            />
          ))}
          <div className="mt-4 mb-2 px-5 text-[0.72rem] uppercase tracking-[0.08em] font-bold text-[#8a7a3a]">
            Question Management
          </div>
          {QUESTION_MENU.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              pathname={pathname}
              onClick={closeMobileMenu}
            />
          ))}
          <div className="mt-4 mb-2 px-5 text-[0.72rem] uppercase tracking-[0.08em] font-bold text-[#8a7a3a]">
            Book Management
          </div>

          {BOOK_MENU.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              pathname={pathname}
              onClick={closeMobileMenu}
            />
          ))}

          <div className="mt-4 mb-2 px-5 text-[0.72rem] uppercase tracking-[0.08em] font-bold text-[#8a7a3a]">
            Other
          </div>

          {MENU_BOTTOM.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              pathname={pathname}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>

        <div
          onClick={handleLogout}
          className="
            sticky bottom-0 px-5 py-[14px]
            font-medium cursor-pointer
            border-t border-[#dfd7d7]
            flex items-center gap-[10px]
            bg-[#faf9f5] z-[100]
            hover:bg-[#f0ece0] transition-colors duration-200
          "
        >
          <LogOut size={18} />
          Logout
        </div>
      </div>
    </>
  );
}
