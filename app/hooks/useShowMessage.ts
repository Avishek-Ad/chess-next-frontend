import { create } from "zustand";

// type statusType = 'success' | 'warning' | 'error'

// type messageQueueItem = {
//  message: string;
//  status: statusType;
// }

interface ShowMessageStore {
  // messageQueue: messageQueueItem[];
  // isQueueEmpty: boolean;
  message: string;
  isavailable: boolean;
  isError: boolean; // remove this
  // status: statusType
  setMessage: (error: boolean, message: string) => void;
  resetMessage: () => void;
}

const useShowMessage = create<ShowMessageStore>((set) => ({
  message: "",
  isavailable: false,
  isError: false, // remove this
  // status: 'success'
  setMessage: (error: boolean, message: string) =>
    set({ isError: error, message: message, isavailable: true }),
  // setMessage: (status:statusType, message: string) => {
  //   set({status:status, message:message, isavailable: true})
  //   },
  resetMessage: () => set({ message: "", isavailable: false, isError: false }),
  //resetMessage: () => set({ message: "", isavailable: false }),
}));

export default useShowMessage;
