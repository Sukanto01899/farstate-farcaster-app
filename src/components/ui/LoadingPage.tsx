import React from "react";

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
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
        <div
          className="absolute w-2 h-2 bg-purple-400 rounded-full animate-twinkle"
          style={{ top: "15%", left: "70%", animationDelay: "0.8s" }}
        ></div>
        <div
          className="absolute w-2 h-2 bg-purple-400 rounded-full animate-twinkle"
          style={{ top: "70%", left: "20%", animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Logo and Content */}
      <div className="relative text-center animate-fadeInUp">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Outer ring animation */}
            <div className="absolute inset-0 bg-purple-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>

            {/* Logo container */}
            <div className="relative bg-slate-900 border-4 border-purple-600 rounded-3xl p-8 shadow-2xl animate-float">
              <div className="w-24 h-24 bg-purple-600 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl">
                <img src="/icon.png" alt="Farstate logo" />
              </div>
            </div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-white text-4xl font-bold mb-2 animate-slideIn">
          Farstate
        </h1>
        <p
          className="text-slate-400 text-sm mb-8 animate-slideIn"
          style={{ animationDelay: "0.2s" }}
        >
          Your Farcaster Activity Hub
        </p>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div
            className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
