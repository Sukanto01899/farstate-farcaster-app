import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// if (!process.env.SERVER_PRIVATE_KEY) {
//   throw new Error("Private key not found!");
// }

const rpcUrl = "https://base-sepolia.g.alchemy.com/v2/y-actUyaM6bEJqmVIO8p7";

// const account = privateKeyToAccount(
//   process.env.SERVER_PRIVATE_KEY as `0x${string}`
// );

// const client = createWalletClient({
//   chain: baseSepolia,
//   transport: http(),
// });

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});

// export default client;
