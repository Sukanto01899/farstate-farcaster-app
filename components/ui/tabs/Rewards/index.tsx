import { Gift } from "lucide-react";
import React, { useState } from "react";
import { drop } from "./drop";
import ExclusiveDrop from "./ExclusiveDrop";

const RewardsTab = () => {
  const [isActiveTab, setActiveTab] = useState(true);
  const activeDrop = drop.filter((d) => d.isActive);
  const endedDrop = drop.filter((d) => !d.isActive);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-purple-800 rounded-2xl p-2  shadow-xl">
        <div className="text-center">
          <div className="h-14 w-14 mx-auto">
            <img src="/gift.gif" className="w-full" />
          </div>
          <h2 className="text-white text-xl font-bold">Exclusive Rewards</h2>
          <p className="text-indigo-200 text-sm mt-1">
            Claim & share drop below
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className={`${
            isActiveTab && "bg-slate-800"
          }  px-4 py-2 rounded-lg border-slate-700 border  text-green-400 text-sm font-bold`}
          onClick={() => setActiveTab(true)}
        >
          Active
        </button>
        <button
          className={`${
            !isActiveTab && "bg-slate-800"
          }  px-4 py-2 rounded-lg border-slate-700 border  text-red-400 text-sm font-bold`}
          onClick={() => setActiveTab(false)}
        >
          Ended
        </button>
      </div>

      <div className="space-y-4">
        {isActiveTab
          ? activeDrop.map((drop) => <ExclusiveDrop {...drop} />)
          : endedDrop.map((drop) => <ExclusiveDrop {...drop} />)}
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
