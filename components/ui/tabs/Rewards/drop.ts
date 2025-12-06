import { abi } from "@/contracts/abi";
import { Monad } from "@/lib/constants";
import { Abi } from "viem";
import { arbitrum, base, Chain, optimism } from "viem/chains";

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
    title: "Exclusive DEGEN Drop",
    description: "Early first 500 users",
    contract: abi.DEGENDrop,
    chain: base,
    isActive: true,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/30096.png",
    reward: "10 DEGEN",
    isUpcoming: false,
  },
  {
    title: "Exclusive OP Drop",
    description: "Early first 50 users",
    contract: abi.OPDrop,
    chain: optimism,
    isActive: false,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
    reward: "0.1 OP",
    isUpcoming: false,
  },
  {
    title: "Exclusive USDC Drop",
    description: "Early first 30 users",
    contract: abi.OPDrop,
    chain: optimism,
    isActive: true,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
    reward: "0.1 USDC",
    isUpcoming: true,
  },
  {
    title: "Exclusive ARB Drop",
    description: "Early first 100 users",
    contract: abi.ARBDrop,
    chain: arbitrum,
    isActive: false,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
    reward: "0.15 ARB",
    isUpcoming: false,
  },
  {
    title: "Exclusive MON Drop",
    description: "Only for first 100 users",
    contract: abi.MONDrop,
    chain: Monad,
    isActive: false,
    icon: "https://monadvision.com/images/token/monad.svg",
    reward: "1 MON",
    isUpcoming: false,
  },
];
