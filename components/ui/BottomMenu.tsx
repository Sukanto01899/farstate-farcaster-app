import {
  Award,
  Coins,
  CoinsIcon,
  Gift,
  Home,
  Shield,
  TrendingUp,
  Wand2,
} from "lucide-react";
import React from "react";
import { Tab, useFrame } from "../providers/farcaster-provider";

interface FooterProps {
  activeTab: string;
  setActiveTab: (tab: Tab) => void;
}

export const BottomMenu: React.FC<FooterProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { context } = useFrame();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4 shadow-2xl">
      <div className="flex justify-around items-center">
        <button
          onClick={() => setActiveTab(Tab.Home)}
          className={`flex flex-col items-center space-y-1 transition-all ${
            activeTab === Tab.Home
              ? "text-purple-400 scale-110"
              : "text-slate-500"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-semibold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab(Tab.Create)}
          className={`flex flex-col items-center space-y-1 transition-all ${
            activeTab === Tab.Create
              ? "text-purple-400 scale-110"
              : "text-slate-500"
          }`}
        >
          <Wand2 className="w-6 h-6" />
          <span className="text-xs font-semibold">Create Cast</span>
        </button>
        <button
          onClick={() => setActiveTab(Tab.Analysis)}
          className={`flex flex-col items-center space-y-1 transition-all ${
            activeTab === Tab.Analysis
              ? "text-purple-400 scale-110"
              : "text-slate-500"
          }`}
        >
          <CoinsIcon className="w-6 h-6" />
          <span className="text-xs font-semibold">Rewards</span>
        </button>

        {context?.user?.fid === 317261 && (
          <button
            onClick={() => setActiveTab(Tab.Admin)}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === Tab.Admin
                ? "text-purple-400 scale-110"
                : "text-slate-500"
            }`}
          >
            <Shield className="w-6 h-6" />
            <span className="text-xs font-semibold">Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
