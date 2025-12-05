import { abi } from "@/contracts/abi";
import { Monad } from "@/lib/constants";
import { Abi } from "viem";
import { arbitrum, Chain } from "viem/chains";

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

export const drop = [
  {
    title: "Exclusive ARB Drop",
    description: "Early first 100 users (FCFS).",
    contract: abi.MONDrop,
    chain: arbitrum,
    isActive: true,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
    reward: "0.15 ARB",
    isUpcoming: true,
  },
  {
    title: "Exclusive MON Drop",
    description: "Only for first 100 users (FCFS).",
    contract: abi.MONDrop,
    chain: Monad,
    isActive: false,
    icon: "https://monadvision.com/images/token/monad.svg",
    reward: "1 MON",
    isUpcoming: false,
  },
];
