import "../styles/globals.css";
import "../styles/loading.css";
import "../styles/select-input.css";
import { NavBar } from "../components/NavBar";
import type { AppProps } from "next/app";
import { useMemo, useState } from "react";
import {
  FewchaWalletAdapter,
  PontemWalletAdapter,
  MartianWalletAdapter,
  WalletProvider,
  AptosWalletAdapter,
} from "@manahippo/aptos-wallet-adapter";
import { ModalContext, ModalState } from "../components/ModalContext";
import { Toaster } from "react-hot-toast";
function WalletSelector({ Component, pageProps }: AppProps) {
  const [modalState, setModalState] = useState<ModalState>({
    walletModal: false,
  });
  const wallets = useMemo(
    () => [
      new AptosWalletAdapter(),
      new MartianWalletAdapter(),
      new PontemWalletAdapter(),
      new FewchaWalletAdapter(),
    ],
    []
  );
  const modals = useMemo(
    () => ({
      modalState,
      setModalState: (modalState: ModalState) => {
        setModalState(modalState);
      },
    }),
    [modalState]
  );

  return (
    <WalletProvider wallets={wallets} autoConnect={false}>
      <ModalContext.Provider value={modals}>
        <div className="px-8">
          <NavBar />
          <Component {...pageProps} className="bg-base-300" />
          <Toaster />
        </div>
      </ModalContext.Provider>
    </WalletProvider>
  );
}

export default WalletSelector;
