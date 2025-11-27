// components/UserStatsBox.tsx
"use client";

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
  return (
    <div className="w-full max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center">
      <div className="text-center sm:text-left space-y-5">
        <h2 className="text-lg text-black font-medium">
          <strong className="text-2xl">{username}</strong>, Ready to play chess
        </h2>
        <p className="text-gray-800">Games Played: <span className="font-semibold">{gamesPlayed}</span></p>
      </div>
      <div className="flex space-x-6 mt-12">
        <div className="text-center">
          <p className="font-semibold text-gray-700">{wins}</p>
          <p className="text-gray-700 text-sm">Wins</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-700">{losses}</p>
          <p className="text-gray-700 text-sm">Losses</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-700">{draws}</p>
          <p className="text-gray-700 text-sm">Draws</p>
        </div>
      </div>
    </div>
  );
}
