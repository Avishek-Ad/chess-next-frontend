"use client";
import Link from "next/link";
import { resetAuthCookies } from "../lib/actions";

interface NavbarProps {
  userid: string | null;
  username: string | undefined;
  setLogoutTriggered: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({
  userid,
  username,
  setLogoutTriggered,
}: NavbarProps) {
  const handleLogout = async () => {
    await resetAuthCookies();
    setLogoutTriggered((prev) => !prev);
  };

  return (
    <nav className="w-full bg-linear-to-r from-gray-50 to-gray-100 shadow-lg px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      {/* Left side: Hello Guest */}
      <div className="text-gray-800 text-2xl font-bold tracking-wide">
        Hello, {userid && username ? username : "Guest"}
      </div>

      {/* Right side: Login & Signup */}
      <div className="flex space-x-4">
        {userid && username ? (
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="px-5 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition transform hover:scale-105"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
