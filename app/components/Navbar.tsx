"use client";
import Link from "next/link";
import { resetAuthCookies } from "../lib/actions";

interface NavbarProps {
  userid: string | null;
  username: string;
}

export default function Navbar({userid, username}:NavbarProps) {

  const handleLogout = async () => {
    await resetAuthCookies();
  };
  return (
    <nav className="w-full bg-gray-100 shadow-md px-6 py-4 flex justify-between items-center">
      {/* Left side: Hello Guest */}
      <div className="text-gray-700 text-2xl font-semibold">
        Hello, {userid && username ? username : "Guest"}
      </div>

      {/* Right side: Login & Signup */}
      <div className="flex space-x-4">
        {userid && username ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
