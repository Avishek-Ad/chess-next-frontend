"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import StatsBox from "./components/StatsBox";
import apiService from "./services/apiService";
import { getUserid } from "./lib/actions";
import useShowMessage from "./hooks/useShowMessage";
import { useRouter } from "next/navigation";

type statusType = {
  username: string;
  total_game_played: number;
  total_game_win: number;
  total_game_loss: number;
  total_game_draw: number;
};

export default function Home() {
  const { setMessage } = useShowMessage();
  const router = useRouter();
  const [stats, setStats] = useState<statusType | null>(null);
  const [userid, setUserid] = useState<string | null>(null);
  const [logoutTriggered, setLogoutTriggered] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.get("/api/auth/stats");
        const uid = await getUserid();

        setStats(response);
        setUserid(uid);
      } catch (err) {
        console.error("API fetch failed:", err);

        // fallback values
        setStats({
          username: "Guest",
          total_game_played: 0,
          total_game_win: 0,
          total_game_loss: 0,
          total_game_draw: 0,
        });
        setUserid(null);
      }
    };

    fetchStats();
  }, [logoutTriggered]);

  const handleRandomGameButton = () => {
    // href="/joining-a-random-game"
    if (userid) {
      router.push("/joining-a-random-game");
    } else {
      setMessage(true, "Please Login in first");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Navbar */}
      <Navbar
        username={stats?.username}
        userid={userid}
        setLogoutTriggered={setLogoutTriggered}
      />

      {/* Content */}
      <div className="flex flex-col grow items-center justify-center px-4 py-6">
        {/* Stats box */}
        <StatsBox
          username={stats?.username}
          gamesPlayed={stats?.total_game_played}
          wins={stats?.total_game_win}
          losses={stats?.total_game_loss}
          draws={stats?.total_game_draw}
        />

        {/* Main buttons */}
        <div className="flex flex-col gap-6 mt-6 w-full max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/create-game"
              className="col-span-1 px-8 py-6 bg-blue-600 text-white rounded-2xl text-lg font-semibold shadow-lg hover:bg-blue-500 transition flex justify-center items-center"
            >
              Create a Game
            </Link>

            <Link
              href="/join-game"
              className="col-span-1 px-8 py-6 bg-green-600 text-white rounded-2xl text-lg font-semibold shadow-lg hover:bg-green-500 transition flex justify-center items-center"
            >
              Join a Game
            </Link>
          </div>

          <button
            onClick={handleRandomGameButton}
            className="px-8 py-6 bg-green-600 text-white rounded-2xl text-lg font-semibold shadow-lg hover:bg-green-500 transition flex justify-center items-center"
          >
            Join a Random Game
            <sub className="text-xs pl-1">coming soon...</sub>
          </button>
        </div>
      </div>
    </div>
  );
}
