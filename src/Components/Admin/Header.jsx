import React from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_TABS = [
  { label: "Add Q&A", route: "/add-qa" },
  { label: "All Q&As", route: "/all-qa" },
  { label: "Add a book", route: "/add-book" },
  { label: "All Books", route: "/all-books" },
];

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    alert("You have been logged out.");
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Green Header */}
      <div
        className="
          bg-[#287346] text-white
          px-7 pt-[18px] pb-[14px]
          flex justify-between items-center flex-wrap
          text-[1.28rem] font-[Segoe_UI,sans-serif]
          max-[600px]:flex-col max-[600px]:items-start
        "
      >
        <span className="font-semibold text-[1.3rem] tracking-[0.02em]">
          Ask Sunnah Admin Panel
        </span>
        <span className="max-[600px]:mt-[10px]">
          <span
            onClick={() => navigate("/dashboard")}
            className="text-white font-bold ml-9 cursor-pointer text-[1.14rem] hover:underline"
          >
            Dashboard
          </span>
          <span
            onClick={handleLogout}
            className="text-white font-bold ml-9 cursor-pointer text-[1.14rem] hover:underline"
          >
            Logout
          </span>
        </span>
      </div>

      {/* Gray Navigation Tabs */}
      <nav
        className="
          bg-[#f0f3f2] py-5 pl-[10px] pr-0
          flex flex-wrap gap-[35px] justify-start
          font-[Segoe_UI,sans-serif]
          max-[600px]:flex-col max-[600px]:gap-3
        "
      >
        {ADMIN_TABS.map((tab) => (
          <span
            key={tab.route}
            onClick={() => navigate(tab.route)}
            className="
              text-[#287346] font-bold cursor-pointer
              text-[1.14rem] px-[7px]
              hover:underline
            "
          >
            {tab.label}
          </span>
        ))}
      </nav>
    </>
  );
}
