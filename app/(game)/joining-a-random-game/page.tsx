"use client";
import useShowMessage from "@/app/hooks/useShowMessage";
import useWebsocket from "@/app/hooks/useWebsocket";
import apiService from "@/app/services/apiService";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateGame() {
  const router = useRouter();
  const { setMessage } = useShowMessage();

  useEffect(() => {
    // send a request to backend in /api/chess/join-a-random-game/
    const sendJoinRequest = async () => {
      const response = await apiService.postwithoutdata(
        "/api/chess/join-a-random-game/"
      );
      if (response.success) {
        setMessage(false, response.message);
      }
    };
    sendJoinRequest();
    // the response will be in the form {'message': "xyz", 'success':true/false}
  }, []);

  const { sendMove } = useWebsocket("/ws/find-game/", (data) => {
    console.log("afsdjasedofijoasfjidojwfsda",data);
    if (data.gameid){
      setMessage(false, "A Match was Found Successfully.")
      router.push(`/chess/${data.gameid}`)
    }
    // now when the data comes use the gameid in the data and redirect the user to the chess/<gameid>
  });

  const handleQuit = async () => {
    await apiService.postwithoutdata('/api/chess/quit-waiting-for-a-random-game/')
    setMessage(
      false,
      "Sorry not many players what to play a random game currently try again"
    );
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center justify-center gap-4 text-gray-700 w-full">
          <LoaderCircle className="animate-spin" size={36} />
          <span className="font-medium">Waiting for a match...</span>

          <button
            onClick={handleQuit}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-400 transition"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}
