import { useFrame } from "@/components/providers/farcaster-provider";
import React, { ReactNode } from "react";
import { Chain } from "viem";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

type ClaimBtnProps = {
  chain: Chain;
  children: ReactNode;
  onClick: () => void;
  className: string;
  disabled?: boolean;
};

const ClaimBtn = ({
  chain,
  children,
  onClick,
  className,
  disabled,
}: ClaimBtnProps) => {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending: chainSwitching } = useSwitchChain();
  const { connect, isPending: walletConnecting } = useConnect();

  if (isConnected) {
    return chainId === chain.id ? (
      <button onClick={onClick} className={className} disabled={disabled}>
        {children}
      </button>
    ) : (
      <button
        disabled={chainSwitching}
        onClick={() => switchChain({ chainId: chain.id })}
        className={`${
          true ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
        }  text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg`}
      >
        {chainSwitching ? "Switching..." : `Switch to ${chain.name}`}
      </button>
    );
  }

  return (
    <button
      disabled={walletConnecting}
      onClick={() => connect({ connector: miniAppConnector() })}
      className={`${
        true ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
      }  text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg`}
    >
      {walletConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};

export default ClaimBtn;
