import { NeynarUser } from "@/hooks/useNeynarUser";
import {
  Award,
  CheckCircle,
  Code,
  Flame,
  Loader,
  LoaderIcon,
  Share2,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { truncateAddress } from "@/lib/utils";
import { Tab, useFrame } from "@/components/providers/farcaster-provider";
import { APP_URL } from "@/lib/constants";
import {
  useAccount,
  useConnect,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { parseEther } from "viem";
import { base } from "viem/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import MintProfile from "./MintProfile";
import useShareCast from "@/hooks/useShareCast";
import DailyClaimReward from "./DailyClaimReward";
import { abi } from "@/contracts/abi";

type FarcasterProfileProps = {
  neynarUser: NeynarUser | null;
};

const FarcasterProfile = ({ neynarUser }: FarcasterProfileProps) => {
  const { context, actions } = useFrame();
  const { address } = useAccount();
  const [showStreakModal, setShowStreakModal] = useState(false);

  const { handleShare } = useShareCast();

  // Read user info from contract
  const { data: userInfo } = useReadContract({
    address: abi.DailyStreakRewards.address,
    abi: abi.DailyStreakRewards.abi,
    functionName: "getUserInfoByFID",
    args: context ? [BigInt(context.user?.fid)] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const streak = userInfo ? Number(userInfo[2]) : 0;
  const canClaim = userInfo ? userInfo[4] : false;
  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              <img
                src={context?.user?.pfpUrl}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full bg-center"
              />
            </div>
            {neynarUser?.pro?.status == "subscribed" && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">
              {context?.user?.displayName &&
                context?.user?.displayName.split(" ")[0]}
            </h2>
            <p className="text-slate-400 text-sm">{context?.user?.username}</p>
            <p className="text-slate-400 text-xs">
              FID:{" "}
              <span className="text-purple-600 font-semibold">
                {context?.user?.fid}
              </span>
            </p>
          </div>
        </div>

        {/* <button
          onClick={() => setShowStreakModal(true)}
          className=" bg-purple-500/20 hover:bg-purple-500/50 ring-2 ring-purple-500 rounded-xl p-2 text-xs text-white font-bold"
        >
          <i>Claim Reward</i>
        </button> */}

        {showStreakModal && (
          <DailyClaimReward setShowStreakModal={setShowStreakModal} />
        )}
      </div>

      {/* Neynar Score - Separate Highlighted Card */}
      <div className="bg-purple-900 rounded-xl p-4 border-2 border-purple-600 mb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-xs mb-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Neynar Score
            </p>
            <p className="text-white text-3xl font-bold">
              {neynarUser?.score ? (
                <i>{neynarUser.score}</i>
              ) : (
                <LoaderIcon className="animate-spin" />
              )}
            </p>
          </div>
          <div className="bg-purple-800 rounded-full p-3">
            <Award className="w-8 h-8 text-purple-300" />
          </div>
        </div>
      </div>

      <MintProfile />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Followers</p>
          <p className="text-white text-xl font-bold">
            {neynarUser?.follower_count ? (
              neynarUser.follower_count
            ) : (
              <LoaderIcon className="animate-spin" />
            )}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Following</p>
          <p className="text-white text-xl font-bold">
            {neynarUser?.following_count ? (
              neynarUser.following_count
            ) : (
              <LoaderIcon className="animate-spin" />
            )}
          </p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
        <p className="text-slate-400 text-xs mb-1">Connected Wallet</p>

        {neynarUser?.verified_addresses?.eth_addresses.map(
          (address: string) => (
            <p className="text-white text-sm font-bold" key={address}>
              {truncateAddress(address)}
            </p>
          )
        )}

        {neynarUser?.verified_addresses?.sol_addresses.map(
          (address: string) => (
            <p className="text-white text-sm font-bold" key={address}>
              {truncateAddress(address)}
            </p>
          )
        )}
      </div>

      <div className="flex justify-between items-center gap-2 ">
        <button
          onClick={async () => {
            await handleShare(
              {
                text: `My Neynar score is ${neynarUser?.score}. Check your score: 🚀`,
                embeds: [
                  `${APP_URL}/share/${context?.user?.fid}`,
                  `${APP_URL}/api/opengraph-image?fid=${context?.user?.fid}`,
                ],
              },
              false
            );
          }}
          className="flex items-center justify-center gap-2 w-full bg-purple-800 text-white py-2 rounded-2xl"
        >
          Share Score <Share2 size={20} />
        </button>
        <button
          onClick={() => {
            actions?.viewProfile({ fid: 317261 });
          }}
          className="flex items-center justify-center gap-2 w-full bg-purple-800 text-white py-2 rounded-2xl"
        >
          Follow Dev <Code size={20} />
        </button>
      </div>

      {/* Marketing  */}
      <div
        onClick={() => setShowStreakModal(true)}
        className="fixed  cursor-pointer flex flex-col gap-2 justify-center items-center bg-gradient  right-4 bottom-24"
      >
        <div className="flex items-center gap-1 relative w-12 h-12">
          <h3 className="text-sm text-white font-bold absolute z-30 top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {streak}
          </h3>
          <Flame
            className="w-full h-full text-orange-400 animate-pulse"
            fill="currentColor"
          />
        </div>
        <div
          className={`${
            canClaim ? "bg-orange-400" : "bg-gray-400"
          } py-1 px-2 rounded-xl text-xs font-bold animate-bounce`}
        >
          {canClaim ? "Daily Degen" : "Already Claimed"}
        </div>
      </div>
    </div>
  );
};

export default FarcasterProfile;
