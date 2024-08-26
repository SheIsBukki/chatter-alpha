import type { GlobalContextType } from "@/components/lib/definitions";
import { useState, createContext } from "react";

export const GlobalContext = createContext<{
  isWriteModalOpen: boolean;
  setWriteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>(null as unknown as GlobalContextType);

export default function GlobalContextProvider({
  children,
}: React.PropsWithChildren) {
  const [isWriteModalOpen, setWriteModalOpen] = useState(false);
  return (
    <GlobalContext.Provider value={{ isWriteModalOpen, setWriteModalOpen }}>
      {children}
    </GlobalContext.Provider>
  );
}
