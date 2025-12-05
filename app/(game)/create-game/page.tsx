"use client";
import useShowMessage from "@/app/hooks/useShowMessage";
import apiService from "@/app/services/apiService";
import { ChessQueen, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";

export default function CreateGame() {
  const router = useRouter();
  const pathname = usePathname();
  const { setMessage } = useShowMessage();
  const [playAs, setPlayAs] = useState<"white" | "black">("white");
  const [gameid, setGameid] = useState("");
  const [loading, setLoading] = useState(false);

  // console.log(pathname);

  // currently we are polling the serverin later version will use websocket
  useEffect(() => {
    if (!gameid) return;

    const interval = setInterval(async () => {
      const response = await apiService.get(`/api/chess/game-status/${gameid}`);
      // console.log(response);
      if (response.status == "active") {
        // move to websocket connection for game
        setMessage(false, "Other Player Joined the Game");
        router.push(`chess/${gameid}`);
      } else if (response.status == "finished") {
        setMessage(false, "The game is finished");
      } else if (response.message) {
        setMessage(true, response.message);
      }
    }, 2000); // every 2 second

    return () => clearInterval(interval); // stop polling when gameid changes or cimponent umounts
  }, [gameid]);

  const handleCreateGame = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.post(
        "/api/chess/create-game/",
        JSON.stringify({ play_as: playAs })
      );

      if (response.gameid) {
        setGameid(response.gameid);
        setMessage(false, "waiting for other player....");
      } else if (
        response.code === "token_not_valid" ||
        response.detail === "Unauthorized"
      ) {
        setMessage(true, "Please login first");
        router.push(`/login/?next=${pathname}`);
      } else {
        setMessage(true, response.detail || "Failed to create game");
      }
    } catch (err) {
      setMessage(true, "An error occurred. Try again!");
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuit = async () => {
    setGameid("");

    const response = await apiService.postwithoutdata(
      `/api/chess/i-am-bored/${gameid}/`
    );
    if (response) {
      setMessage(false, response.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
        {gameid === "" ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Choose Your Side
            </h2>
            <form className="space-y-5" onSubmit={handleCreateGame}>
              <div className="flex gap-6 h-32">
                {["white", "black"].map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setPlayAs(side as "white" | "black")}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 
                        ${
                          playAs === side
                            ? "bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-lg scale-105"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-200 hover:scale-105"
                        } 
                      `}
                  >
                    <ChessQueen
                      className={`w-10 h-10 stroke-2 ${
                        side === "white" ? "text-white" : "text-black"
                      }`}
                    />
                    <span className="text-lg">
                      {side.charAt(0).toUpperCase() + side.slice(1)}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
                  loading
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircle className="animate-spin" size={18} />
                    Creating...
                  </div>
                ) : (
                  "Start Game"
                )}
              </button>
            </form>
            <div className="flex flex-col">
              <p className="text-center text-gray-500 text-xs mt-4">
                Ready to play? Select your side and start!
              </p>
              <Link
                href="/"
                className="underline inline-block mx-auto text-center text-gray-500 hover:text-blue-300 text-xs mt-4"
              >
                Go home
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-gray-700 w-full">
            {/* Read-only game ID with copy button */}
            <div className="flex flex-col items-center gap-1 w-full max-w-md">
              <p className="text-gray-600 text-xs font-bold text-center">
                Share this ID with the other player
              </p>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  readOnly
                  value={gameid}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(gameid);
                    setMessage(false, "Game ID copied!");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition"
                >
                  Copy
                </button>
              </div>
            </div>

            <LoaderCircle className="animate-spin" size={36} />
            <span className="font-medium">Waiting for other player...</span>

            <button
              onClick={handleQuit} // Reset gameid to exit waiting
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-400 transition"
            >
              Quit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
