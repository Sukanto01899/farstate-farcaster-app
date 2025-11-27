import { useMiniApp } from "@neynar/react";
import React from "react";
import { useNeynarUser } from "~/hooks/useNeynarUser";
import { truncateAddress } from "~/lib/truncateAddress";

const UserWallet = () => {
  const { context } = useMiniApp();
  const { user: neynarUser } = useNeynarUser(context || undefined);
  return (
    <div className="rounded-lg w-full bg-primary-light/20 backdrop-blur-md border-2 border-primary p-4">
      <h2 className="text-xl font-bold mb-4">Verified Address</h2>

      <div className="space-y-4">
        {neynarUser?.verified_addresses.eth_addresses.map((address) => (
          <p
            key={address}
            className="text-sm text-wrap overflow-hidden text-primary dark:text-primary-light font-semibold"
          >
            {truncateAddress(address)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default UserWallet;
