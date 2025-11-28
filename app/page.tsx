import Link from "next/link";
import Navbar from "./components/Navbar";
import StatsBox from "./components/StatsBox";
import apiService from "./services/apiService";
import { getUserid } from "./lib/actions";

export default async function Home() {
  let response = null;
  let userid = null;

  try {
    response = await apiService.get("/api/auth/stats");
    userid = await getUserid();
  } catch (err) {
    console.error("API fetch failed:", err);
    // Optionally provide fallback values
    response = {
      username: "Guest",
      total_game_played: 0,
      total_game_win: 0,
      total_game_loss: 0,
      total_game_draw: 0,
    };
  }
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Navbar */}
      <Navbar username={response?.username} userid={userid} />

      {/* Content container */}
      <div className="flex flex-col grow items-center justify-center px-4 py-6">
        {/* Stats box */}
        <StatsBox
          username={response?.username}
          gamesPlayed={response?.total_game_played}
          wins={response?.total_game_win}
          losses={response?.total_game_loss}
          draws={response?.total_game_draw}
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
            disabled
            className="px-8 py-6 bg-green-600 text-white rounded-2xl text-lg font-semibold shadow-lg hover:bg-green-500 transition flex justify-center items-center"
          >
            Join a Random Game
            <sub className="text-xs pl-1">comming soon...</sub>
          </button>
        </div>
      </div>
    </div>
  );
}
