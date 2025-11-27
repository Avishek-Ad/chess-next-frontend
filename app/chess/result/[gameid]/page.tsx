"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/app/services/apiService";
import { getUserid } from "@/app/lib/actions";
import { LoaderCircle } from "lucide-react";

interface Player {
  id: string | number;
  username: string;
}

interface GameDetails {
  player_white: Player;
  player_black: Player;
  winner: string | number | null;
  status: string;
}

export default function PlayerStatus({
  params,
}: {
  params: Promise<{ gameid: string }>;
}) {
  const { gameid } = React.use(params);
  const router = useRouter();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = await getUserid();
        setCurrentUserId(id);
      } catch (err) {
        console.error("Failed to get user ID");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch game result
  useEffect(() => {
    if (!gameid || currentUserId === null) return;

    const fetchGame = async () => {
      try {
        const res = await apiService.get(`/api/chess/game/${gameid}/`);
        const winnerId = res.winner
          ? typeof res.winner === "object" ? res.winner.id : res.winner
          : null;

        setGame({
          player_white: res.player_white,
          player_black: res.player_black,
          winner: winnerId,
          status: res.status || "finished",
        });
      } catch (err) {
        console.error("Failed to load game result");
      }
    };

    fetchGame();
  }, [gameid, currentUserId]);

  if (loading || !game || currentUserId === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-lg">
          <LoaderCircle className="animate-spin mx-auto" size={40} />
          <p className="text-center text-gray-600 mt-4">Loading result...</p>
        </div>
      </div>
    );
  }

  const isDraw = game.winner === null;
  const myId = String(currentUserId);
  const whiteId = String(game.player_white.id);
  const blackId = String(game.player_black.id);
  const winnerId = game.winner ? String(game.winner) : null;

  const iAmWhite = whiteId === myId;
  const iAmBlack = blackId === myId;
  const iWon = winnerId && (iAmWhite && winnerId === whiteId) || (iAmBlack && winnerId === blackId);

  const winnerName = winnerId === whiteId ? game.player_white.username : game.player_black.username;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {isDraw ? (
            <span className="text-yellow-600">It's a Draw</span>
          ) : iWon ? (
            <span className="text-green-600">You Won!</span>
          ) : (
            <span className="text-red-600">You Lost</span>
          )}
        </h2>

        {/* Players */}
        <div className="space-x-2 grid grid-cols-5">

          {/* White */}
          <div className={`col-span-2 p-5 rounded-xl border-2 transition-all ${
            iAmWhite ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
          }`}>
            <div className="flex flex-col justify-between items-center">
              <div>
                <p className="font-semibold text-lg text-gray-800">{game.player_white.username}</p>
                <p className="text-sm text-gray-600">White</p>
              </div>
              <div className="text-right">
                {winnerId === whiteId ? <span className="text-green-600 font-bold">Winner</span> :<span className="text-red-600 font-bold">Looser</span>}
                {iAmWhite && <span className="text-blue-600 text-sm font-medium">← You</span>}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center col-span-1">
            <div className="bg-gray-800 text-white px-3 py-3 rounded-full font-bold text-xl">
              VS
            </div>
          </div>

          {/* Black */}
          <div className={`col-span-2 p-5 rounded-xl border-2 transition-all ${
            iAmBlack ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
          }`}>
            <div className="flex flex-col justify-between items-center">
              <div>
                <p className="font-semibold text-lg text-gray-800">{game.player_black.username}</p>
                <p className="text-sm text-gray-600">Black</p>
              </div>
              <div className="text-right">
                {winnerId === blackId ? <span className="text-green-600 font-bold">Winner</span>:<span className="text-red-600 font-bold">Looser</span>}
                {iAmBlack && <span className="text-blue-600 text-sm font-medium">← You</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Winner Summary */}
        {!isDraw && (
          <p className="text-center mt-8 text-lg font-medium text-gray-700">
            <span className="text-green-600 font-bold">{winnerName}</span> wins the game!
          </p>
        )}

        {/* Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full mt-10 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition shadow-md"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}