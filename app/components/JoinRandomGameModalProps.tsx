// components/CreateGameModal.tsx
"use client";

import { LoaderCircle } from "lucide-react";
import useShowMessage from "@/app/hooks/useShowMessage";
import useWebsocket from "@/app/hooks/useWebsocket";
import apiService from "@/app/services/apiService";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface CreateGameModalProps {
  onClose: () => void;
}

export default function CreateGameModal({ onClose }: CreateGameModalProps) {
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
      "Sorry, not many players want to play a random game currently. Try again."
    );
     onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleQuit} // click outside closes
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
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
