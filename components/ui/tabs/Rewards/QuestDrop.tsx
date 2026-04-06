import { quickAuth } from "@farcaster/miniapp-sdk";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Loader, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useTransactionReceipt,
  useWriteContract,
} from "wagmi";
import ClaimBtn from "./ClaimBtn";
import { QuestsDropType } from "./drop";
import { useFrame } from "@/components/providers/farcaster-provider";
import useShareCast from "@/hooks/useShareCast";
import { BUILDER_DATA_SUFFIX } from "@/lib/builder-code";
import { APP_URL } from "@/lib/constants";

function getUtcDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getVisitStorageKey(id: number) {
  return `quest-visited-${id}-${getUtcDateKey()}`;
}

function getVerifiedStorageKey(id: number) {
  return `quest-verified-${id}-${getUtcDateKey()}`;
}

type VerificationResult = {
  verified: boolean;
  error?: string | null;
};

function getUserFacingError(error: unknown) {
  const fallback = "Something went wrong. Please try again.";

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message || fallback;
  const lowered = message.toLowerCase();

  if (
    lowered.includes("user rejected") ||
    lowered.includes("user denied") ||
    lowered.includes("rejected the request") ||
    lowered.includes("request rejected") ||
    lowered.includes("transaction execution reverted: user rejected") ||
    lowered.includes("cancelled") ||
    lowered.includes("canceled")
  ) {
    return "Transaction cancelled.";
  }

  if (lowered.includes("insufficient funds")) {
    return "Insufficient funds for gas.";
  }

  if (lowered.includes("quest verification")) {
    return message;
  }

  return message.split("\n")[0].slice(0, 120) || fallback;
}

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
  visitLabel = "Visit App",
  verifyLabel = "Verify Quest",
}: QuestsDropType) => {
  const { context, actions } = useFrame();
  const { address, isConnected, chainId } = useAccount();
  const { address: contractAddress, abi } = contract;
  const { handleShare } = useShareCast();
  const [isVisited, setIsVisited] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { switchChain, isPending: chainSwitching, error } = useSwitchChain();

  const {
    data: isClaimed,
    refetch: refetchIsClaimed,
    isLoading: isClaimedLoading,
  } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "claimedFid",
    args: context ? [BigInt(context.user?.fid)] : undefined,
  });
  const { data: fidEpoch, isLoading: loadingFidEpoch } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "fidEpoch",
  });
  const { data: maxEpoch, isLoading: loadingMaxEpoch } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "MAX_FIDEPOCH",
  });
  const { data: isPaused, isLoading: loadingIsPaused } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "paused",
  });

  const { mutateAsync: verifyQuest, isPending: verifyPending } = useMutation({
    mutationFn: async () => {
      if (!quickAuth) {
        throw new Error("QuickAuth is not available");
      }

      const { token } = await quickAuth.getToken();
      const res = await fetch("/api/quests/self-verify", {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const body = (await res.json().catch(() => null)) as
        | VerificationResult
        | { error?: string | null; verified?: boolean }
        | null;

      if (!res.ok || !body?.verified) {
        throw new Error(body?.error || "Quest verification failed");
      }

      return body;
    },
  });

  const { mutateAsync: getSignature, isPending: signaturePending } =
    useMutation({
      mutationFn: async () => {
        if (!quickAuth || !address) {
          throw new Error("QuickAuth is not available");
        }

        const { token } = await quickAuth.getToken();
        const res = await fetch("/api/signature/quest-drop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userAddress: address,
            contract: contract.address,
            chainId: contract.chain?.id,
          }),
        });

        if (!res.ok) {
          const errorBody = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            errorBody?.error || `Request failed with status ${res.status}`,
          );
        }

        return (await res.json()) as {
          signature: string;
          fid: number;
          nonce: string;
          deadline: string;
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

  const initialLoading =
    isClaimedLoading || loadingFidEpoch || loadingIsPaused || loadingMaxEpoch;
  const txLoading = signaturePending || claimPending;
  const totalClaimed = fidEpoch ? Number(fidEpoch.toString()) : 0;
  const maxClaimEpoch = maxEpoch ? Number(maxEpoch.toString()) : 0;
  const claimDisabled =
    signaturePending ||
    claimPending ||
    !!isClaimed ||
    totalClaimed >= maxClaimEpoch ||
    initialLoading ||
    loadingFidEpoch ||
    !isVerified;

  const handleVisitMiniApp = () => {
    setStatusMessage(null);
    localStorage.setItem(getVisitStorageKey(id), "true");
    localStorage.removeItem(getVerifiedStorageKey(id));
    setIsVisited(true);
    setIsVerified(false);
    actions?.openUrl(appUrl);
  };

  const handleVerifyQuest = async () => {
    setStatusMessage(null);
    try {
      await verifyQuest();
      localStorage.setItem(getVerifiedStorageKey(id), "true");
      setIsVerified(true);
      toast.success("Quest verified");
    } catch (error) {
      localStorage.removeItem(getVerifiedStorageKey(id));
      setIsVerified(false);
      const message = getUserFacingError(error);
      setStatusMessage(message);
      toast.error(message);
    }
  };

  const handleClaimDrop = async () => {
    setStatusMessage(null);
    try {
      const signatureData = await getSignatureWithRetry();
      const signature = signatureData?.signature;
      const userFid = signatureData?.fid;
      const nonce = signatureData?.nonce;
      const deadline = signatureData?.deadline;

      if (!signature || !userFid || !nonce || !deadline) {
        setStatusMessage("Signature not received. Please try again.");
        return;
      }

      await claimDrop(
        {
          address: contractAddress,
          abi,
          functionName: "claimDrop",
          args: [
            BigInt(userFid),
            BigInt(nonce),
            BigInt(deadline),
            signature as `0x${string}`,
          ],
          dataSuffix: BUILDER_DATA_SUFFIX,
        },
        {
          onSuccess: () => {
            toast.success("Transaction submitted");
            handleAutoCast();
          },
        },
      );
    } catch (error) {
      const message = getUserFacingError(error);
      setStatusMessage(message);
      toast.error(message);
    }
  };

  const getSignatureWithRetry = async (maxRetries = 2) => {
    let lastError: unknown = null;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        if (attempt > 0) {
          setRetrying(true);
          setRetryCount(attempt);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
        const res = await getSignature();
        setRetrying(false);
        setRetryCount(0);
        return res;
      } catch (error) {
        lastError = error;
      }
    }

    setRetrying(false);
    setRetryCount(0);
    throw lastError;
  };

  const handleAutoCast = () => {
    handleShare(
      {
        text: `I just claimed ${reward} from the Farstate AI quest drop.\n\nTry it below.`,
        embeds: [`${APP_URL}/share/${context?.user?.fid || ""}`],
      },
      false,
    );
  };

  useEffect(() => {
    setIsVisited(localStorage.getItem(getVisitStorageKey(id)) === "true");
    setIsVerified(localStorage.getItem(getVerifiedStorageKey(id)) === "true");
  }, [id]);

  useEffect(() => {
    if (isTxConfirmed) {
      refetchIsClaimed();
    }
  }, [isTxConfirmed, refetchIsClaimed]);

  useEffect(() => {
    if (isClaimed) {
      setStatusMessage(null);
    }
  }, [isClaimed]);

  const steps = [
    {
      label: visitLabel,
      done: isVisited,
    },
    {
      label: verifyLabel,
      done: isVerified,
    },
    {
      label: "Claim Reward",
      done: Boolean(isClaimed),
    },
  ];

  const renderAction = () => {
    if (isConnected && chainId !== contract.chain.id) {
      return (
        <button onClick={() => switchChain({ chainId: contract.chain.id })}>
          Switch to {contract.chain.name}
        </button>
      );
    }

    if (initialLoading) {
      return (
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Loader className="h-4 w-4 animate-spin" />
          Checking...
        </div>
      );
    }

    if (totalClaimed >= maxClaimEpoch) {
      return (
        <div className="text-amber-300 text-sm font-bold">All Claimed</div>
      );
    }

    if (isClaimed) {
      return (
        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Claimed
        </div>
      );
    }

    if (isUpcoming) {
      return <div className="text-blue-400 text-sm font-bold">Upcoming</div>;
    }

    if (!isActive && !isPaused) {
      return <div className="text-red-400 text-sm font-bold">Ended</div>;
    }

    if (!isVisited) {
      return (
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-purple-700"
          onClick={handleVisitMiniApp}
        >
          <ExternalLink className="h-4 w-4" />
          {visitLabel}
        </button>
      );
    }

    if (!isVerified) {
      return (
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          disabled={verifyPending}
          onClick={handleVerifyQuest}
        >
          {verifyPending ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              {verifyLabel}
            </>
          )}
        </button>
      );
    }

    return (
      <ClaimBtn
        chain={contract.chain}
        disabled={claimDisabled}
        onClick={handleClaimDrop}
        className={`rounded-xl px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all ${
          claimDisabled ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {txLoading ? (
          <span className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin" />
            {retrying ? `Retrying (${retryCount})...` : "Claiming..."}
          </span>
        ) : (
          "Claim Now"
        )}
      </ClaimBtn>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl transition-all hover:border-purple-600">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="mb-1 text-base font-bold text-white">
            {title}{" "}
            {isActive && !isUpcoming && totalClaimed < maxClaimEpoch && (
              <span className="rounded-full bg-green-500 px-2 py-1 text-xs animate-pulse">
                Live
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            {description}{" "}
            {isActive && !isUpcoming && (
              <span className="text-xs font-semibold text-purple-400">
                ({totalClaimed}/{maxClaimEpoch})
              </span>
            )}
          </p>
        </div>
        <img src={icon} alt="" className="h-9 w-9 rounded-full" />
      </div>

      <div className="mb-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
            <p className="text-sm font-bold text-amber-400">{reward}</p>
          </div>
          <button
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 transition-colors hover:text-sky-300"
            onClick={handleVisitMiniApp}
            type="button"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open app link
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`rounded-xl border px-2.5 py-2 text-xs ${
                step.done
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-800 bg-slate-900 text-slate-400"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Step {index + 1}
              </p>
              <p className="mt-1 line-clamp-2 font-semibold leading-tight">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] leading-tight text-slate-500">
          Verify before claiming.
        </div>
        {renderAction()}
      </div>

      {statusMessage && (
        <p className="mt-2 rounded-lg bg-red-500/10 p-2 text-center text-xs text-red-300">
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default QuestDrop;
