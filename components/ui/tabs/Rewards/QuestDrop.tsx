import { quickAuth } from "@farcaster/miniapp-sdk";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  useAccount,
  useReadContract,
  useTransactionReceipt,
  useWriteContract,
} from "wagmi";
import toast from "react-hot-toast";
import ClaimBtn from "./ClaimBtn";
import { QuestsDropType } from "./drop";
import { useFrame } from "@/components/providers/farcaster-provider";
import useShareCast from "@/hooks/useShareCast";
import { APP_URL } from "@/lib/constants";

const QuestDrop = ({
  title,
  description,
  contract,
  isActive,
  icon,
  reward,
  isUpcoming,
  appUrl,
  id,
}: QuestsDropType) => {
  const { context, actions } = useFrame();
  const { address } = useAccount();
  const { address: contractAddress, abi } = contract;
  const { handleShare } = useShareCast();
  const [isVisited, setIsVisited] = useState(false);

  const {
    data: isClaimed,
    refetch: refetchIsClaimed,
    isLoading: isClaimedLoading,
  } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "claimedFid",
    args: context ? [BigInt(context?.user?.fid)] : undefined,
  });
  const { data: fidEpoch, isLoading: loadingFidEpoch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "fidEpoch",
  });
  const { data: maxEpoch, isLoading: loadingMaxEpoch } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "MAX_FIDEPOCH",
  });
  const { data: isPaused, isLoading: loadingIsPaused } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "paused",
  });

  const { mutateAsync: getSignature, isPending: signaturePending } =
    useMutation({
      mutationFn: async () => {
        if (!quickAuth || !address) {
          throw new Error("QuickAuth is not available");
        }
        const { token } = await quickAuth.getToken();
        const res = await fetch("/api/signature/drop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userAddress: address,
            contract: contract.address,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(text || `Request failed with status ${res.status}`);
        }

        // parse and return JSON so onSuccess receives the parsed object (with `success`)
        return (await res.json()) as {
          signature: string;
          fid: number;
          isSuccess: boolean;
        };
      },
    });
  const {
    writeContractAsync: claimDrop,
    isPending: claimPending,
    data,
  } = useWriteContract();
  const { isSuccess: isTxConfirmed } = useTransactionReceipt({
    hash: data,
    query: { enabled: !!data },
  });

  //   Extra variable for state showing
  const initialLoading =
    isClaimedLoading || loadingFidEpoch || loadingIsPaused || loadingMaxEpoch;
  const txLoading = signaturePending || claimPending;
  const totalClaimed = fidEpoch ? parseInt(fidEpoch.toString()) : 0;
  const maxClaimEpoch = maxEpoch ? parseInt(maxEpoch.toString()) : 0;
  const disableBtn =
    signaturePending ||
    claimPending ||
    !!isClaimed ||
    totalClaimed >= maxClaimEpoch ||
    initialLoading ||
    txLoading ||
    loadingFidEpoch;

  // mini app visit handler
  const handleVisitMiniApp = () => {
    localStorage.removeItem(`quest-visited-2`);
    if (!isVisited) {
      localStorage.setItem(`quest-visited-${id}`, "true");
      actions?.openMiniApp({
        url: appUrl,
      });
    }
  };

  // Claim function
  const handleClaimDrop = async () => {
    try {
      const signatureData = await getSignature();
      const signature = signatureData?.signature;
      const userFid = signatureData?.fid;
      if (!signature || !userFid) {
        return;
      }
      await claimDrop(
        {
          address: contractAddress,
          abi: abi,
          functionName: "claimDrop",
          args: [BigInt(userFid), signature as `0x${string}`],
        },
        {
          onSuccess: () => {
            toast.success("Transaction submitted");
            handleAutoCast();
          },
        }
      );
    } catch (error) {
      console.log(error);
      toast.error("Claim failed");
    }
  };

  useEffect(() => {
    if (isTxConfirmed) {
      refetchIsClaimed();
    }
  }, [isTxConfirmed]);

  const handleAutoCast = () => {
    handleShare(
      {
        text: `🎉 I just claimed ${reward} from the Farstate Ai Exclusive Drop!

try it below 👇
              `,
        embeds: [`${APP_URL}/share/${context?.user?.fid || ""}`],
      },
      false
    );
  };

  useEffect(() => {
    const isVisited = localStorage.getItem(`quest-visited-${id}`);
    if (isVisited) {
      setIsVisited(true);
    }
  }, [id]);
  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl hover:border-purple-600 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white text-lg font-bold mb-1">
            {title}{" "}
            {isActive && !isUpcoming && totalClaimed < maxClaimEpoch && (
              <span className="bg-green-500 py-1 px-2 rounded-full text-xs animate-pulse">
                Live
              </span>
            )}
          </h3>
          <p className="text-slate-400 text-sm">
            {description}{" "}
            {isActive && !isUpcoming && (
              <span className="text-xs text-purple-400 font-semibold">
                ({totalClaimed}/{maxClaimEpoch})
              </span>
            )}
          </p>
        </div>
        <img src={icon} alt="" className="h-8 w-8 rounded-full" />
      </div>

      <div className="flex items-center justify-between">
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <p className="text-amber-400 text-sm font-bold">{reward}</p>
        </div>
        {isUpcoming ? (
          <div
            onClick={handleAutoCast}
            className="text-blue-400 text-sm font-bold"
          >
            Upcoming
          </div>
        ) : !isVisited ? (
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
            onClick={handleVisitMiniApp}
          >
            Visit To Claim
          </button>
        ) : isActive || isPaused ? (
          <ClaimBtn
            chain={contract.chain}
            disabled={disableBtn}
            onClick={handleClaimDrop}
            className={`${
              disableBtn ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            }  text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg`}
          >
            {initialLoading ? (
              <span className="flex items-center gap-2">
                <Loader className="animate-spin" /> Checking...
              </span>
            ) : totalClaimed >= maxClaimEpoch ? (
              "All Claimed"
            ) : isClaimed ? (
              "You'r Claimed"
            ) : txLoading ? (
              <span className="flex items-center gap-2">
                <Loader className="animate-spin" /> Claiming...
              </span>
            ) : (
              "Claim Now"
            )}
          </ClaimBtn>
        ) : (
          <div className="text-red-400 text-sm font-bold">Ended</div>
        )}
      </div>
    </div>
  );
};

export default QuestDrop;
