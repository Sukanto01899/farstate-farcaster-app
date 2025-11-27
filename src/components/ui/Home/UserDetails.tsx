import { useMiniApp } from "@neynar/react";
import React from "react";
import { useNeynarUser } from "~/hooks/useNeynarUser";
import { StarIcon, User, UserPlus, Users } from "lucide-react";

const UserDetails = () => {
  const { context } = useMiniApp();
  const { user: neynarUser } = useNeynarUser(context || undefined);

  const detailsStyle =
    "p-4 flex items-center space-x-4 rounded-lg backdrop-blur-md";
  return (
    <div className="grid grid-cols-2 gap-2 p-2 rounded-xl w-full bg-primary-light/20 backdrop-blur-md border-2 border-primary">
      {/* Score */}
      <div className={detailsStyle}>
        <span className="w-8 h-8 bg-primary-light/10 rounded-xl flex items-center justify-center">
          <StarIcon className="" />
        </span>
        <div>
          <h2 className="text-lg font-bold">Neynar Score</h2>
          <p className="text-md text-primary dark:text-primary-light font-semibold">
            {neynarUser ? neynarUser.score : "N/A"}
          </p>
        </div>
      </div>
      {/* FID */}
      <div className={detailsStyle}>
        <User />
        <div>
          <h2 className="text-lg font-bold">Your FID</h2>
          <p className="text-md text-primary dark:text-primary-light font-semibold">
            {context ? context.user?.fid : "N/A"}
          </p>
        </div>
      </div>
      {/* Follower */}
      <div className={detailsStyle}>
        <Users />
        <div>
          <h2 className="text-lg font-bold">Your Follower</h2>
          <p className="text-md text-primary dark:text-primary-light font-semibold">
            {neynarUser ? neynarUser.follower_count : "N/A"}
          </p>
        </div>
      </div>
      {/* Following */}
      <div className={detailsStyle}>
        <UserPlus />
        <div>
          <h2 className="text-lg font-bold">Your Following</h2>
          <p className="text-md text-primary dark:text-primary-light font-semibold">
            {neynarUser ? neynarUser.following_count : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
