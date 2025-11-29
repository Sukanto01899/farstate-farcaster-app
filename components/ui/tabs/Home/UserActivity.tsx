import { useFrame } from "@/components/providers/farcaster-provider";
import {
  useNeynarUserActivity,
  UserActivityStats,
} from "@/hooks/useNeynerActivity";
import { LoaderIcon } from "lucide-react";
import React from "react";

type UserActivityProps = {
  userActivity: UserActivityStats | null;
};

const UserActivity = ({ userActivity }: UserActivityProps) => {
  const { context } = useFrame();

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Likes</p>
        <p className="text-white text-xl font-bold">
          {userActivity?.totalLikesReceived ? (
            userActivity.totalLikesReceived
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Casts</p>
        <p className="text-white text-xl font-bold">
          {userActivity?.totalCasts ? (
            userActivity.totalCasts
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Comments</p>
        <p className="text-white text-xl font-bold">
          {userActivity?.totalCommentsReceived ? (
            userActivity.totalCommentsReceived
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Recasts</p>
        <p className="text-white text-xl font-bold">
          {userActivity?.totalRecastsReceived ? (
            userActivity.totalRecastsReceived
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
    </div>
  );
};

export default UserActivity;
