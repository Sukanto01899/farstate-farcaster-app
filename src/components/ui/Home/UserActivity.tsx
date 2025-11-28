import { useMiniApp } from "@neynar/react";
import { LoaderIcon } from "lucide-react";
import React from "react";
import { useUserActivity } from "~/hooks/useUserActivity";

const UserActivity = () => {
  const { context } = useMiniApp();
  const { user } = useUserActivity(context || undefined);
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Likes</p>
        <p className="text-white text-xl font-bold">
          {user?.totalLikesReceived ? (
            user.totalLikesReceived
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Casts</p>
        <p className="text-white text-xl font-bold">
          {user?.totalCasts ? (
            user.totalCasts
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Comments</p>
        <p className="text-white text-xl font-bold">
          {user?.totalCommentsReceived ? (
            user.totalCommentsReceived
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">Recasts</p>
        <p className="text-white text-xl font-bold">
          {user?.totalRecastsReceived ? (
            user.totalRecastsReceived
          ) : (
            <LoaderIcon className="animate-spin" />
          )}
        </p>
      </div>
    </div>
  );
};

export default UserActivity;
