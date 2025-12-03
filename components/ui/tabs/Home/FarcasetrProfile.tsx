import { NeynarUser } from "@/hooks/useNeynarUser";
import {
  Award,
  CheckCircle,
  FireExtinguisher,
  Gift,
  Loader,
  LoaderIcon,
  TrendingUp,
} from "lucide-react";
import React from "react";
import { truncateAddress } from "@/lib/utils";
import { Tab, useFrame } from "@/components/providers/farcaster-provider";
import { ShareCast } from "../../common/ShareCast";
import { APP_URL } from "@/lib/constants";
import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";

type FarcasterProfileProps = {
  neynarUser: NeynarUser | null;
};

const FarcasterProfile = ({ neynarUser }: FarcasterProfileProps) => {
  const { context, actions, setTab } = useFrame();
  const { sendTransaction: supportDev, isPending: supportPending } =
    useSendTransaction();
  const { sendTransaction: sendGM, isPending: gmPending } =
    useSendTransaction();
  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              <img
                src={context?.user?.pfpUrl}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full"
              />
            </div>
            {neynarUser?.pro?.status == "subscribed" && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">
              {context?.user?.displayName}
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

        <button
          onClick={() => {
            sendGM({
              to: "0x49ee323Ea1Bb65F68FA75df0c6D441d20d83A8Cd",
              value: parseEther("0"),
            });
          }}
          className=" bg-purple-500/20 hover:bg-purple-500/50 ring-2 ring-purple-500 rounded-full p-3 text-lg text-white font-bold"
        >
          {gmPending ? <Loader className="h-5 w-5 animate-spin" /> : <i>GM</i>}
        </button>
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

      <ShareCast
        buttonText="Share Your Score"
        cast={{
          text: `My Neynar Score is ${neynarUser?.score}. Check your score: 🚀`,
          bestFriends: false,
          embeds: [`${APP_URL}/share/${context?.user?.fid || ""}`],
        }}
        className="w-full bg-purple-500 rounded-2xl mb-4"
      />

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
          onClick={() => {
            supportDev({
              to: "0x49ee323Ea1Bb65F68FA75df0c6D441d20d83A8Cd",
              value: parseEther("0.0001"),
            });
          }}
          className="w-full bg-purple-500 text-white py-2 rounded-2xl"
        >
          {supportPending ? "Loading..." : "Support Dev"}
        </button>
        <button
          onClick={() => {
            actions?.viewProfile({ fid: 317261 });
          }}
          className="w-full bg-purple-500 text-white py-2 rounded-2xl"
        >
          Follow Dev
        </button>
      </div>

      {/* Marketing  */}
      <div
        onClick={() => setTab(Tab.Analysis)}
        className="fixed shadow-md animate-pulse cursor-pointer flex justify-center items-center bg-gradient bg-gradient-to-tr from-purple-900 via-purple-700 to-purple-500 h-12 w-12 rounded-full right-4 bottom-24"
      >
        <Gift />
      </div>
    </div>
  );
};

export default FarcasterProfile;
