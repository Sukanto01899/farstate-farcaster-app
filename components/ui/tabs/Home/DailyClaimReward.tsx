import React, { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  Coins,
  Zap,
  Star,
  Loader2,
  Wallet,
  X,
} from "lucide-react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useSwitchChain,
  useConnect,
} from "wagmi";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { formatEther } from "viem";
import Modal from "../../common/Modal";
import { quickAuth } from "@farcaster/miniapp-sdk";
import { base } from "viem/chains";
import { abi } from "@/contracts/abi";
import { useFrame } from "@/components/providers/farcaster-provider";

// Contract ABI
const CONTRACT_ABI = abi.DailyStreakRewards.abi;
// Contract Address
const CONTRACT_ADDRESS = abi.DailyStreakRewards.address;

export default function StreakCard({
  setShowStreakModal,
}: {
  setShowStreakModal: (show: boolean) => void;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { context } = useFrame();
  const { switchChainAsync } = useSwitchChain();
  const { connectAsync } = useConnect();
  const [celebrating, setCelebrating] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [signatureData, setSignatureData] = useState<{
    fid: string;
    nonce: string;
    signature: string;
  } | null>(null);
  const [fetchingSignature, setFetchingSignature] = useState(false);

  // Read user info from contract
  const {
    data: userInfo,
    refetch: refetchUserInfo,
    isLoading: isUserInfoLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getUserInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Read time until next claim
  const { data: timeData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTimeUntilNextClaim",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // Write contract - claim daily
  const {
    writeContract: claimDaily,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract();

  // Write contract - withdraw rewards
  const {
    writeContract: withdrawRewards,
    data: withdrawHash,
    isPending: isWithdrawPending,
    error: withdrawError,
  } = useWriteContract();

  // Wait for claim transaction
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  // Wait for withdraw transaction
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  // Watch for DailyClaimed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "DailyClaimed",
    onLogs: (logs) => {
      const userLog = logs.find(
        (log: any) => log.args.user?.toLowerCase() === address?.toLowerCase()
      );
      if (userLog) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 2000);
        refetchUserInfo();
      }
    },
  });

  // Watch for WeeklyBonusClaimed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "WeeklyBonusClaimed",
    onLogs: (logs) => {
      const userLog = logs.find(
        (log: any) => log.args.user?.toLowerCase() === address?.toLowerCase()
      );
      if (userLog) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 3000);
        refetchUserInfo();
      }
    },
  });

  // Watch for RewardsWithdrawn events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "RewardsWithdrawn",
    onLogs: (logs) => {
      const userLog = logs.find(
        (log: any) => log.args.user?.toLowerCase() === address?.toLowerCase()
      );
      if (userLog) {
        setShowWithdrawSuccess(true);
        setTimeout(() => setShowWithdrawSuccess(false), 3000);
        refetchUserInfo();
      }
    },
  });

  // Refetch after successful transactions
  useEffect(() => {
    if (isClaimSuccess || isWithdrawSuccess) {
      refetchUserInfo();
    }
  }, [isClaimSuccess, isWithdrawSuccess, refetchUserInfo]);

  // Parse user info

  const streak = userInfo ? Number(userInfo[2]) : 0;
  const pendingRewards = userInfo ? formatEther(userInfo[3]) : "0";
  const canClaim = userInfo ? userInfo[4] : false;
  const lastClaimTime = userInfo ? Number(userInfo[1]) : 0;

  const daysUntilBonus = 7 - (streak % 7);
  const progress = ((streak % 7) / 7) * 100;

  // Calculate time until next claim
  const getTimeUntilNextClaim = () => {
    if (!timeData) return "Loading...";

    const [available, timeRemaining] = timeData;

    if (available) return "Ready to claim!";

    const remaining = Number(timeRemaining);
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Fetch signature from backend
  const fetchSignature = async () => {
    if (!address) return;

    if (!quickAuth) {
      throw new Error("QuickAuth is not available");
    }
    const { token } = await quickAuth.getToken();

    setFetchingSignature(true);
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/signature/daily-claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userAddress: address,
          contract: CONTRACT_ADDRESS,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch signature");

      const data = await response.json();
      setSignatureData({
        fid: data.fid,
        nonce: data.nonce,
        signature: data.signature,
      });

      return data;
    } catch (error) {
      console.error("Error fetching signature:", error);
      return null;
    } finally {
      setFetchingSignature(false);
    }
  };

  const handleClaim = async () => {
    if (!canClaim || isClaimPending || isClaimConfirming || fetchingSignature)
      return;

    if (!isConnected) {
      await connectAsync({ connector: miniAppConnector() });
    }
    if (chainId !== base.id) {
      await switchChainAsync({ chainId: base.id });
    }

    // Fetch signature from backend
    const sigData = await fetchSignature();

    if (!sigData) {
      alert("Failed to get signature. Please try again.");
      return;
    }

    claimDaily({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimDaily",
      args: [
        BigInt(sigData.fid),
        BigInt(sigData.nonce),
        sigData.signature as `0x${string}`,
      ],
    });
  };

  const handleWithdraw = () => {
    if (
      isWithdrawPending ||
      isWithdrawConfirming ||
      parseFloat(pendingRewards) === 0
    )
      return;

    withdrawRewards({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "withdrawRewards",
    });
  };

  const claiming = isClaimPending || isClaimConfirming || fetchingSignature;
  const withdrawing = isWithdrawPending || isWithdrawConfirming;
  const initialLoading = isUserInfoLoading;

  console.log(userInfo);

  return (
    <Modal>
      <div className="relative w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-purple-500 rounded-lg blur-2xl opacity-30 animate-pulse"></div>

        {/* Main card */}
        <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-2xl overflow-hidden border border-purple-400/30">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-0 w-60 h-60 bg-pink-300 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="relative p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Flame
                    className="w-8 h-8 text-orange-400"
                    fill="currentColor"
                  />
                  {celebrating && (
                    <div className="absolute inset-0 animate-ping">
                      <Flame
                        className="w-8 h-8 text-orange-300"
                        fill="currentColor"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Daily Streak</h2>
                  <p className="text-purple-200 text-sm">Keep it burning! 🔥</p>
                </div>
              </div>
              <div
                onClick={() => setShowStreakModal(false)}
                className={`p-2 rounded-full text-white bg-slate-800/50 flex items-center gap-1 cursor-pointer hover:bg-slate-800/70 transition`}
              >
                <X />
              </div>
            </div>

            {/* Streak counter - main focus */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-lg">
              <div className="text-center space-y-2">
                <p className="text-purple-200 text-sm font-medium">
                  Current Streak
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 ${
                      celebrating ? "animate-bounce" : ""
                    }`}
                  >
                    {streak}
                  </div>
                  <Flame
                    className="w-6 h-6 text-orange-400 animate-pulse"
                    fill="currentColor"
                  />
                </div>
                <p className="text-white font-semibold text-sm">
                  Days in a row!
                </p>
              </div>
            </div>

            {/* Progress to weekly bonus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-200 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-300" />
                  Weekly Bonus
                </span>
                <span className="text-white font-bold">
                  {daysUntilBonus} days left
                </span>
              </div>
              <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden border border-purple-500/30">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-purple-200 text-xs text-center">
                Complete 7 days to earn 10 DEGEN bonus! 🎁
              </p>
            </div>

            {/* Rewards section with withdraw button */}
            <div className="bg-gradient-to-br from-purple-500/30 to-indigo-600/30 backdrop-blur-sm rounded-xl p-2 border border-purple-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-300" />
                  <div>
                    <p className="text-purple-200 text-xs">Pending Rewards</p>
                    <p className="text-lg font-bold text-white">
                      {parseFloat(pendingRewards).toFixed(2)} DEGEN
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing || parseFloat(pendingRewards) === 0}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      parseFloat(pendingRewards) > 0 && !withdrawing
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/30 transform hover:scale-105 active:scale-95"
                        : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {withdrawing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isWithdrawPending ? "Confirming..." : "Processing..."}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Claim
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {showWithdrawSuccess && (
                <p className="text-green-300 text-xs text-center animate-pulse">
                  ✓ Rewards withdrawn successfully!
                </p>
              )}
            </div>

            {/* Claim button */}
            <button
              onClick={handleClaim}
              disabled={!canClaim || claiming || initialLoading}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all duration-300 transform ${
                canClaim && !claiming
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50 active:scale-95"
                  : "bg-gray-600/50 text-gray-300 cursor-not-allowed"
              } ${claiming ? "animate-pulse" : ""}`}
            >
              {initialLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </span>
              ) : claiming ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {fetchingSignature
                    ? "Getting signature..."
                    : isClaimPending
                    ? "Confirm in wallet..."
                    : "Processing..."}
                </span>
              ) : canClaim ? (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Claim Daily Reward
                </span>
              ) : (
                "✓ Claimed Today! Come back tomorrow"
              )}
            </button>

            {/* Error messages */}
            {claimError && (
              <p className="text-red-300 text-xs text-center bg-red-500/10 rounded-lg p-2">
                ⚠️ {claimError.message.split("\n")[0].slice(0, 80)}...
              </p>
            )}
            {withdrawError && (
              <p className="text-red-300 text-xs text-center bg-red-500/10 rounded-lg p-2">
                ⚠️ {withdrawError.message.split("\n")[0].slice(0, 80)}...
              </p>
            )}

            {/* Footer info */}
            <div className="flex items-center justify-center gap-4 text-xs text-purple-200">
              <span>Next claim: {getTimeUntilNextClaim()}</span>
            </div>
          </div>
        </div>

        {/* Floating particles effect */}
        {celebrating && (
          <>
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
            <div
              className="absolute top-1/3 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-ping"
              style={{ animationDelay: "0.4s" }}
            ></div>
            <div
              className="absolute top-1/2 right-1/3 w-2 h-2 bg-pink-300 rounded-full animate-ping"
              style={{ animationDelay: "0.6s" }}
            ></div>
          </>
        )}
      </div>
    </Modal>
  );
}
