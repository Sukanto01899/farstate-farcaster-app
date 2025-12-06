import { useFrame } from "@/components/providers/farcaster-provider";
import { abi } from "@/contracts/abi";
import React from "react";
import {
  useAccount,
  useConnect,
  useReadContract,
  useSwitchChain,
  useTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "../../common/Button";
import toast from "react-hot-toast";
import { CircleCheck, Loader } from "lucide-react";
import { parseEther } from "viem";
import { base } from "viem/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { useEffect } from "react";

const MintProfile = () => {
  const { context } = useFrame();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { connectAsync } = useConnect();

  const {
    data: canMint,
    isLoading: isCanMintLoading,
    refetch,
  } = useReadContract({
    address: abi.ProfileNFT.address,
    abi: abi.ProfileNFT.abi,
    functionName: "canMint",
    args: address ? [address] : undefined,
  });

  const {
    writeContractAsync: MINTProfile,
    isPending,
    data,
  } = useWriteContract();

  const handleMINT = async () => {
    if (!context || !context?.user?.fid) return;
    try {
      if (!isConnected) {
        await connectAsync({ connector: miniAppConnector() });
      }
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      await MINTProfile(
        {
          address: abi.ProfileNFT.address,
          abi: abi.ProfileNFT.abi,
          functionName: "mint",
          args: [BigInt(context?.user?.fid)],
          value: parseEther("0.001"),
        },
        {
          onSuccess: () => {
            toast.success("Onchain Profile Minted");
          },
        }
      );
    } catch (error) {
      toast.error("MINT failed");
    }
  };

  const { isSuccess } = useTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess]);

  const disabledBtn = isCanMintLoading || isPending || !canMint || isPending;
  return (
    <Button
      onClick={handleMINT}
      disabled={disabledBtn}
      className={`${
        disabledBtn ? "bg-purple-400" : "bg-purple-800"
      } w-full  rounded-2xl mb-4 text-white font-semibold`}
    >
      {isCanMintLoading ? (
        <span className="flex items-center gap-2">
          <Loader className="animate-spin" /> Checking Onchain Profile...
        </span>
      ) : canMint ? (
        isPending ? (
          <span className="flex items-center gap-2">
            <Loader className="animate-spin" /> Minting Profile Onchain...
          </span>
        ) : (
          "Mint Onchain Profile"
        )
      ) : (
        <span className="flex items-center gap-2">
          Onchain Profile Minted <CircleCheck className="text-xs" size={20} />
        </span>
      )}
    </Button>
  );
};

export default MintProfile;
