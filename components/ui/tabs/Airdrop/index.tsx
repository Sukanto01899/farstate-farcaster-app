import { Gift, Sparkles } from "lucide-react";
import React from "react";

const AirdropTab = () => {
  const airdrops = [
    {
      id: 1,
      name: "Mint Genesis NFT",
      cost: 500,
      description: "Exclusive NFT for early adopters",
    },
    {
      id: 2,
      name: "Mint Profile Badge",
      cost: 300,
      description: "Special verified badge",
    },
    {
      id: 3,
      name: "Convert Points to Tokens",
      cost: 1000,
      description: "Exchange for $CAST tokens",
    },
  ];
  return (
    // <div className="space-y-4 animate-fadeIn">
    //   {/* Airdrop Header */}
    //   <div className="bg-indigo-900 rounded-2xl p-6 border-2 border-indigo-600 shadow-xl">
    //     <div className="text-center">
    //       <Gift className="w-12 h-12 text-indigo-300 mx-auto mb-2" />
    //       <h2 className="text-white text-2xl font-bold">Exclusive Airdrops</h2>
    //       <p className="text-indigo-200 text-sm mt-1">Claim your rewards</p>
    //     </div>
    //   </div>

    //   {/* Airdrop Items */}
    //   <div className="space-y-4">
    //     {airdrops.map((airdrop) => (
    //       <div
    //         key={airdrop.id}
    //         className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl hover:border-purple-600 transition-all"
    //       >
    //         <div className="flex items-start justify-between mb-3">
    //           <div className="flex-1">
    //             <h3 className="text-white text-lg font-bold mb-1">
    //               {airdrop.name}
    //             </h3>
    //             <p className="text-slate-400 text-sm">{airdrop.description}</p>
    //           </div>
    //           <Sparkles className="w-6 h-6 text-purple-400" />
    //         </div>

    //         <div className="flex items-center justify-between">
    //           <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
    //             <p className="text-amber-400 text-sm font-bold">
    //               {airdrop.cost} points
    //             </p>
    //           </div>
    //           <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg">
    //             Claim Now
    //           </button>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <div className="text-center mt-4 text-lg">Airdrop Coming Soon</div>
  );
};

export default AirdropTab;
