import React, { useState } from "react";
import {
  Home,
  Gift,
  CheckCircle,
  Twitter,
  Users,
  Wallet,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const FarcasterMiniApp = () => {
  const [activeTab, setActiveTab] = useState("home");

  const profileData = {
    username: "cryptouser.eth",
    userId: "@cryptouser",
    verified: true,
    followers: "12.5K",
    following: "892",
    neynarScore: 8.7,
    ethAddress: "0x742d...4f2a",
    solAddress: "Hn2g...8kQ3",
    likes: 345,
    casts: 456,
    comments: 892,
    recasts: 234,
    points: 2450,
  };

  const tasks = [
    {
      id: 1,
      name: "Follow on Farcaster",
      icon: Users,
      points: 100,
      completed: true,
    },
    {
      id: 2,
      name: "Follow on Twitter",
      icon: Twitter,
      points: 100,
      completed: false,
    },
    {
      id: 3,
      name: "Verify Wallet",
      icon: Wallet,
      points: 200,
      completed: true,
    },
    {
      id: 4,
      name: "Complete Profile",
      icon: CheckCircle,
      points: 150,
      completed: false,
    },
  ];

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
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Animated stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{ top: "20%", left: "10%", animationDelay: "0s" }}
        ></div>
        <div
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{ top: "40%", left: "80%", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{ top: "60%", left: "30%", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{ top: "80%", left: "70%", animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{ top: "30%", left: "50%", animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative bg-slate-900 border-b-2 border-purple-600 px-6 py-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Farcaster</h1>
              <p className="text-slate-400 text-xs">Activity Tracker</p>
            </div>
          </div>
          <div className="bg-purple-600 w-2 h-2 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-4 py-6">
        {activeTab === "home" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Profile Card */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    CU
                  </div>
                  {profileData.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">
                    {profileData.username}
                  </h2>
                  <p className="text-slate-400 text-sm">{profileData.userId}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">Followers</p>
                  <p className="text-white text-xl font-bold">
                    {profileData.followers}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">Following</p>
                  <p className="text-white text-xl font-bold">
                    {profileData.following}
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
                      {profileData.neynarScore}
                    </p>
                  </div>
                  <div className="bg-purple-800 rounded-full p-3">
                    <Award className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
                <p className="text-slate-400 text-xs mb-1">Connected Wallet</p>
                {/* <p className="text-white text-lg font-bold">{profileData.walletAddress}</p> */}
              </div>

              {/* Activity Stats - Text Format */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-2">
                <p className="text-white text-sm">
                  <span className="text-slate-400">Likes:</span>{" "}
                  <span className="font-semibold ml-2">
                    {profileData.likes}
                  </span>
                </p>
                <p className="text-white text-sm">
                  <span className="text-slate-400">Casts:</span>{" "}
                  <span className="font-semibold ml-2">
                    {profileData.casts}
                  </span>
                </p>
                <p className="text-white text-sm">
                  <span className="text-slate-400">Comments:</span>{" "}
                  <span className="font-semibold ml-2">
                    {profileData.comments}
                  </span>
                </p>
                <p className="text-white text-sm">
                  <span className="text-slate-400">Recasts:</span>{" "}
                  <span className="font-semibold ml-2">
                    {profileData.recasts}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "earn" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Points Display */}
            <div className="bg-amber-900 rounded-2xl p-6 border-2 border-amber-600 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-200 text-sm mb-1">Total Points</p>
                  <p className="text-white text-4xl font-bold">
                    {profileData.points}
                  </p>
                </div>
                <div className="bg-amber-800 rounded-full p-3">
                  <Award className="w-12 h-12 text-amber-300" />
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-white text-lg font-bold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                Social Tasks
              </h3>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all border ${
                      task.completed
                        ? "bg-green-900 border-green-600"
                        : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <task.icon
                        className={`w-5 h-5 ${
                          task.completed ? "text-green-400" : "text-purple-400"
                        }`}
                      />
                      <span className="text-white text-sm font-medium">
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-400 text-sm font-bold">
                        +{task.points}
                      </span>
                      {task.completed && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "airdrop" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Airdrop Header */}
            <div className="bg-indigo-900 rounded-2xl p-6 border-2 border-indigo-600 shadow-xl">
              <div className="text-center">
                <Gift className="w-12 h-12 text-indigo-300 mx-auto mb-2" />
                <h2 className="text-white text-2xl font-bold">
                  Exclusive Airdrops
                </h2>
                <p className="text-indigo-200 text-sm mt-1">
                  Claim your rewards
                </p>
              </div>
            </div>

            {/* Airdrop Items */}
            <div className="space-y-4">
              {airdrops.map((airdrop) => (
                <div
                  key={airdrop.id}
                  className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl hover:border-purple-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white text-lg font-bold mb-1">
                        {airdrop.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {airdrop.description}
                      </p>
                    </div>
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                      <p className="text-amber-400 text-sm font-bold">
                        {airdrop.cost} points
                      </p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg">
                      Claim Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4 shadow-2xl">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === "home"
                ? "text-purple-400 scale-110"
                : "text-slate-500"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("earn")}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === "earn"
                ? "text-purple-400 scale-110"
                : "text-slate-500"
            }`}
          >
            <Award className="w-6 h-6" />
            <span className="text-xs font-semibold">Earn</span>
          </button>
          <button
            onClick={() => setActiveTab("airdrop")}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === "airdrop"
                ? "text-purple-400 scale-110"
                : "text-slate-500"
            }`}
          >
            <Gift className="w-6 h-6" />
            <span className="text-xs font-semibold">Airdrop</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FarcasterMiniApp;
