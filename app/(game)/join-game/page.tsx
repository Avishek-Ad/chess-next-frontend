"use client";
import useShowMessage from "@/app/hooks/useShowMessage";
import apiService from "@/app/services/apiService";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function JoinGame() {
  const router = useRouter();
  const pathname = usePathname();
  const { setMessage } = useShowMessage();
  const [gameid, setGameid] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gameid");
    if (saved) setGameid(saved);
  }, []);

  const handlesubmit = async (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("gameid", gameid);
    // console.log("joining a game");
    try {
      const response = await apiService.postwithoutdata(
        `/api/chess/join-game/${gameid}/`
      );
      // console.log(response);
      if (response.detail === "Unauthorized") {
        setMessage(true, "Please login first");
        router.push(`/login/?next=${pathname}`);
      } else if (response.gameid) {
        localStorage.removeItem("gameid");
        setMessage(false, response.message);
        // go to the websocket connection
        router.push(`chess/${gameid}`);
      } else {
        setMessage(true, "Invalid game id, Try another");
      }
    } catch (err) {
      console.error("Join game failed:", err);
      setMessage(true, "Server unreachable. Try again later.");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Join a game
        </h2>
        <form className="space-y-4" onSubmit={(e) => handlesubmit(e)}>
          <input
            required
            value={gameid}
            onChange={(e) => setGameid(e.target.value)}
            type="text"
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-airbnb transition"
            placeholder="Enter the game id"
          />

          <button
            type="submit"
            className="w-full py-3 bg-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-400 transition-all duration-200 shadow-sm"
          >
            Join
          </button>
        </form>
        <div className="flex flex-col">
          <p className="text-center text-gray-500 text-xs mt-4">
            Ready to play? Enter game-id and join
          </p>
          <Link
            href="/"
            className="underline inline-block mx-auto text-center text-gray-500 hover:text-blue-300 text-xs mt-4"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
