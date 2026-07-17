import { useNavigate } from "react-router-dom";
import { adminLogin, isTokenValid } from "../../api/adminAuth";
import React, { useEffect, useState } from "react";
export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (isTokenValid(token)) {
      navigate("/dashboard", { replace: true });
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [navigate]);
  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Please enter both fields");
      return;
    }

    const result = await adminLogin(username, password);

    if (result.success) {
      localStorage.setItem("adminToken", result.token);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 800);
    } else {
      setMessage(result.message || "Login failed");
    }
  };

  const isSuccess = message.includes("success");

  return (
    <div
      className="
    m-0 p-0
    font-[var(--font-family)]
    bg-[#fdfdfd]
    min-h-screen
    flex items-center justify-center
  "
    >
      <div
        className="
          w-[88vw]
          max-w-[380px]
          bg-white
          rounded-[20px]
          px-[1.8rem]
          py-[2rem]
          shadow-[0_8px_32px_rgba(0,0,0,0.09)]
          border border-[#eaeff5]
          text-center
          max-[480px]:px-[1.6rem]
          max-[480px]:py-[1.9rem]
        "
      >
        {/* Gold circle + white lock */}
        <div
          className="
            w-[62px]
            h-[62px]
            bg-[#c3a421]
            rounded-full
            mx-auto
            mb-[1rem]
            flex
            items-center
            justify-center
          "
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="m-0 mb-[0.35rem] text-[1.55rem] font-semibold text-[#1a202c]">
          Admin Portal
        </h2>

        <p className="m-0 mb-[1.4rem] text-[0.89rem] text-[#64748b]">
          Secure administration access
        </p>

        <label
          className="
            block
            text-left
            mb-[0.4rem]
            text-[0.89rem]
            font-medium
            text-[#374151]
          "
        >
          Username
        </label>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          className="
            w-full
            px-[0.95rem]
            py-[0.78rem]
            mb-[0.9rem]
            border-[1.4px]
            border-[#e2e8f0]
            rounded-[10px]
            text-[0.95rem]
            bg-white
            transition-all
            box-border
            focus:outline-none
            focus:border-[#c3a421]
            focus:shadow-[0_0_0_3.5px_rgba(195,164,33,0.16)]
          "
        />

        <label
          className="
            block
            text-left
            mb-[0.4rem]
            text-[0.89rem]
            font-medium
            text-[#374151]
          "
        >
          Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full
            px-[0.95rem]
            py-[0.78rem]
            mb-[0.9rem]
            border-[1.4px]
            border-[#e2e8f0]
            rounded-[10px]
            text-[0.95rem]
            bg-white
            transition-all
            box-border
            focus:outline-none
            focus:border-[#c3a421]
            focus:shadow-[0_0_0_3.5px_rgba(195,164,33,0.16)]
          "
        />

        <button
          onClick={handleLogin}
          className="
            w-full
            py-[0.85rem]
            mt-[0.5rem]
            bg-[#c3a421]
            text-white
            border-none
            rounded-[10px]
            text-[1.02rem]
            font-semibold
            cursor-pointer
            transition-all
            shadow-[0_4px_14px_rgba(195,164,33,0.32)]
            hover:bg-[#b0931d]
            hover:-translate-y-[1.5px]
            hover:shadow-[0_8px_20px_rgba(195,164,33,0.38)]
          "
        >
          Sign In
        </button>

        <div
          className={`
            min-h-[22px]
            mt-[0.9rem]
            px-[0.8rem]
            py-[0.45rem]
            rounded-[8px]
            text-[0.88rem]
            font-medium
            transition-all
            ${
              isSuccess
                ? "bg-[rgba(46,125,50,0.12)] text-[#2e7d32]"
                : "bg-[rgba(211,47,47,0.12)] text-[#c62828]"
            }
            ${message ? "opacity-100" : "opacity-0"}
          `}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
