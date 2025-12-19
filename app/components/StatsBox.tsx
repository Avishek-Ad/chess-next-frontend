"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserStatsBoxProps {
  username?: string;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  draws?: number;
}

export default function StatsBox({
  username = "Guest",
  gamesPlayed = 0,
  wins = 0,
  losses = 0,
  draws = 0,
}: UserStatsBoxProps) {
  const data = {
    labels: ["Wins", "Losses", "Draws"],
    datasets: [
      {
        data: [wins, losses, draws], // dummy data
        backgroundColor: [
          "#16a34a", // green-600 (wins)
          "#dc2626", // red-600 (losses)
          "#ca8a04", // yellow-600 (draws)
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-linear-to-r from-white to-gray-50 shadow-xl rounded-3xl py-6 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-6">
      {/* User Info */}
      <div className="flex-1 px-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          <span className="text-2xl sm:text-3xl">{username}</span>, Ready to play chess
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Total Games Played:{" "}
          <span className="font-semibold text-gray-800">{gamesPlayed}</span>
        </p>

        {/* Stats badges */}
        <div className="flex justify-between sm:justify-start mt-4 sm:mt-6 space-x-4">
          <div className="flex flex-col items-center px-5 py-2 bg-green-100 text-green-800 rounded-2xl shadow">
            <p className="text-lg font-bold">{wins}</p>
            <p className="text-sm">Wins</p>
          </div>
          <div className="flex flex-col items-center px-4 py-2 bg-red-100 text-red-800 rounded-2xl shadow">
            <p className="text-lg font-bold">{losses}</p>
            <p className="text-sm">Losses</p>
          </div>
          <div className="flex flex-col items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-2xl shadow">
            <p className="text-lg font-bold">{draws}</p>
            <p className="text-sm">Draws</p>
          </div>
        </div>
      </div>

      {/* Placeholder for chart */}
      <div className="w-72 flex items-center justify-center">
        {gamesPlayed > 0 ? (
          <Pie data={data} options={options} />
        ) : (
          <div className="w-full h-52 sm:h-72 flex flex-col items-center justify-center 
                          bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-sm text-gray-500 font-medium">
              No games played yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Play a game to see stats
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
