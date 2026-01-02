import { abi } from "@/contracts/abi";
import { Monad } from "@/lib/constants";
import { Abi } from "viem";
import { arbitrum, base, celo, Chain, optimism } from "viem/chains";

export type DropType = {
  title: string;
  description: string;
  contract: { address: `0x${string}`; abi: Abi; chain: Chain };
  chain: Chain;
  isActive: Boolean;
  icon: string;
  reward: string;
  isUpcoming: Boolean;
};
export type QuestsDropType = {
  title: string;
  description: string;
  contract: { address: `0x${string}`; abi: Abi; chain: Chain };
  chain: Chain;
  isActive: Boolean;
  icon: string;
  reward: string;
  isUpcoming: Boolean;
  appUrl: string;
  id: number;
};

export const drop = [
  {
    title: "Exclusive WCT Drop",
    description: "Claim WCT Drop (FCFS)",
    contract: abi.WCTDrop,
    chain: base,
    isActive: true,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/33152.png",
    reward: "0.3 $WCT",
    isUpcoming: false,
  },
  {
    title: "Exclusive MON Drop",
    description: "Claim Monad Drop (FCFS)",
    contract: abi.MONDrop,
    chain: Monad,
    isActive: false,
    icon: "https://monadvision.com/images/token/monad.svg",
    reward: "1 $MON",
    isUpcoming: false,
  },

  {
    title: "Exclusive DONUT Drop",
    description: "Claim DONUT Drop (FCFS)",
    contract: abi.DONUTDrop,
    chain: base,
    isActive: false,
    icon: "https://assets.coingecko.com/coins/images/70995/standard/donut-logo.jpg?1765020130",
    reward: "0.1 $DONUT",
    isUpcoming: false,
  },
  {
    title: "Exclusive DEGEN Drop",
    description: "Claim DEGEN Drop (FCFS)",
    contract: abi.DEGENDrop,
    chain: base,
    isActive: true,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/30096.png",
    reward: "3 $DEGEN",
    isUpcoming: false,
  },
  {
    title: "Exclusive CELO Drop",
    description: "Claim CELO Drop (FCFS)",
    contract: abi.CELODrop,
    chain: celo,
    isActive: false,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/5567.png",
    reward: "0.1 $CELO",
    isUpcoming: false,
  },

  {
    title: "Exclusive TOSHI Drop",
    description: "Early first 500 users",
    contract: abi.TOSHIDrop,
    chain: base,
    isActive: false,
    icon: "https://assets.coingecko.com/coins/images/31126/standard/Toshi_Logo_-_Circular.png?1721677476",
    reward: "10 $TOSHI",
    isUpcoming: false,
  },

  {
    title: "Exclusive ARB Drop",
    description: "Claim ARB Drop (FCFS)",
    contract: abi.ARBDrop,
    chain: arbitrum,
    isActive: false,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
    reward: "0.1 ARB",
    isUpcoming: false,
  },

  {
    title: "Exclusive OP Drop",
    description: "Claim OP Drop (FCFS)",
    contract: abi.OPDrop,
    chain: optimism,
    isActive: false,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
    reward: "0.1 OP",
    isUpcoming: false,
  },

  {
    title: "Exclusive USDC Drop",
    description: "Claim USDC Drop (FCFS)",
    contract: abi.ExclusiveUSDCDrop,
    chain: base,
    isActive: false,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
    reward: "0.02 $USDC",
    isUpcoming: false,
  },
];

export const questDrop = [
  {
    id: 1,
    title: "Alchemy Mini App Visit",
    description: "Visit Alchemy Mini App to claim reward",
    contract: abi.JesseDrop,
    chain: base,
    isActive: true,
    icon: "https://alchemy-fc.vercel.app/icon.png",
    reward: "1 $jesse",
    isUpcoming: false,
    appUrl: "https://farcaster.xyz/miniapps/wLLjqojZVubo/alchemy",
  },
];
