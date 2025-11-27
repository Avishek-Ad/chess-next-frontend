import { create } from "zustand";

interface ShowMessageStore {
  message: string;
  isavailable: boolean;
  isError: boolean;
  setMessage: (error:boolean, message: string) => void;
  resetMessage: () => void;
}

const useShowMessage = create<ShowMessageStore>((set) => ({
  message: "",
  isavailable: false,
  isError: false,
  setMessage: (error:boolean, message: string) => set({ isError:error, message: message, isavailable: true }),
  resetMessage: () => set({ message: "", isavailable: false, isError:false }),
}));

export default useShowMessage;
