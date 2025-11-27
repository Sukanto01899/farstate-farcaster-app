import { useMiniApp } from "@neynar/react";
import React from "react";
import { useNeynarUser } from "~/hooks/useNeynarUser";

const ProfileCard = () => {
  const { context } = useMiniApp();
  const { user: neynarUser } = useNeynarUser(context || undefined);
  return (
    <div className="rounded-full w-full bg-primary-light/20 backdrop-blur-md border-2 border-primary">
      <div className="flex justify-between items-center">
        <div className="p-2 flex items-center space-x-4">
          <img
            src={context?.user?.pfpUrl || "/default-pfp.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-primary"
          />
          <div>
            <h2 className="text-xl font-bold">
              {context?.user?.displayName || context?.user?.username}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{context?.user?.username}
            </p>
          </div>
        </div>

        {/* User pro or not */}
        <div className="p-4 text-right">
          {neynarUser?.pro.state === "unsubscribed" ? (
            <>
              <span className="bg-primary px-3 py-1 rounded-full text-sm font-semibold text-white">
                Pro
              </span>
            </>
          ) : (
            <span className="border border-gray-600 px-3 py-1 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-400">
              Not Pro
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
