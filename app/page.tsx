"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import StatsBox from "./components/StatsBox";
import apiService from "./services/apiService";
import { getUserid } from "./lib/actions";
import useShowMessage from "./hooks/useShowMessage";
import { useRouter } from "next/navigation";
import CreateGameModal from "./components/JoinRandomGameModalProps";

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
   const [showJoinRandomGameModal, setShowJoinRandomGameModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.get("/api/auth/stats");
        const uid = await getUserid();

        setStats(response);
        setUserid(uid);
      } catch (err) {
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
    if (userid) {
      setShowJoinRandomGameModal(true)
    } else {
      setMessage(true, "Please login first");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-zinc-200 via-gray-200 to-zinc-300">
      {/* Navbar */}
      <Navbar
        username={stats?.username}
        userid={userid}
        setLogoutTriggered={setLogoutTriggered}
      />

      {/* Main Content */}
      <main className="flex flex-col grow items-center justify-center px-4 py-5">
        {/* Stats */}
        <StatsBox
          username={stats?.username}
          gamesPlayed={stats?.total_game_played}
          wins={stats?.total_game_win}
          losses={stats?.total_game_loss}
          draws={stats?.total_game_draw}
        />

        {/* Action Area */}
        <section className="mt-10 w-full max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/create-game"
              className="group relative px-8 py-6 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-3xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex justify-center items-center"
            >
              Create a Game
              <span className="absolute inset-0 rounded-3xl ring-2 ring-blue-400 opacity-0 group-hover:opacity-100 transition" />
            </Link>

            <Link
              href="/join-game"
              className="group relative px-8 py-6 bg-linear-to-r from-emerald-600 to-emerald-500 text-white rounded-3xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex justify-center items-center"
            >
              Join a Game
              <span className="absolute inset-0 rounded-3xl ring-2 ring-emerald-400 opacity-0 group-hover:opacity-100 transition" />
            </Link>
          </div>

          <button
            onClick={handleRandomGameButton}
            className="group relative mt-4 w-full px-8 py-6
                      bg-linear-to-r from-emerald-700 to-emerald-600
                      text-white rounded-3xl text-lg font-semibold
                      shadow-lg hover:shadow-xl
                      transition-all flex justify-center items-center
                      focus:outline-none"
          >
            🎲 Join a Random Game

            {/* Hover ring overlay (same as Link) */}
            <span className="pointer-events-none absolute inset-0 rounded-3xl
                            ring-2 ring-emerald-400 opacity-0
                            group-hover:opacity-100
                            transition" />
          </button>
        </section>

        {showJoinRandomGameModal && <CreateGameModal onClose={() => setShowJoinRandomGameModal(false)} />}
      </main>
    </div>
  );
}
