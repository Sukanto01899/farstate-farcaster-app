import { NeynarUser, useNeynarUser } from "@/hooks/useNeynarUser";
import { Award, CheckCircle, LoaderIcon, TrendingUp, User } from "lucide-react";
import React from "react";
import UserActivity from "./UserActivity";
import { truncateAddress } from "@/lib/utils";
import { useFrame } from "@/components/providers/farcaster-provider";
import { UserActivityStats } from "@/hooks/useNeynerActivity";
import { ShareCast } from "../../common/ShareCast";
import { APP_URL } from "@/lib/constants";

type FarcasterProfileProps = {
  neynarUser: NeynarUser | null;
  userActivity: UserActivityStats | null;
};

const FarcasterProfile = ({
  neynarUser,
  userActivity,
}: FarcasterProfileProps) => {
  const { context } = useFrame();
  return (
    <div>
      {/* Profile Card */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              <img
                src={context?.user?.pfpUrl}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full"
              />
            </div>
            {neynarUser?.pro.state == "subscriber" && (
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
                  neynarUser.score
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

        {/* Activity Stats */}
        <UserActivity userActivity={userActivity} />

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
      </div>
    </div>
  );
};

export default FarcasterProfile;
