import { Gift, Sparkles } from "lucide-react";
import React from "react";
import MonDrop from "./MonDrop";

const RewardsTab = () => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-indigo-900 rounded-2xl p-2 border-2 border-indigo-600 shadow-xl">
        <div className="text-center">
          <Gift className="w-12 h-12 text-indigo-300 mx-auto mb-2" />
          <h2 className="text-white text-xl font-bold">Exclusive Rewards</h2>
          <p className="text-indigo-200 text-sm mt-1">
            Claim & share drop below
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <MonDrop />
      </div>

      <div className="flex flex-col justify-center items-center">
        <p className="text-white text-sm text-center">
          More Big Drop Coming soon!
        </p>
        <p className="text-xs text-purple-300 mt-2">
          More Active, More Rewards
        </p>
      </div>
    </div>
  );
};

export default RewardsTab;
