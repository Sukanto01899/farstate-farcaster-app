"use client";

import { Monad } from "@/lib/constants";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import { base, monadTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [base, Monad],
  transports: {
    [base.id]: http(),
    // [monadTestnet.id]: http(),
    [Monad.id]: http(),
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
