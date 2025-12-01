import { Sparkles, Wand2 } from "lucide-react";
import React from "react";

const CreateHeader = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-3 border border-purple-600 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-bold flex items-center">
            <Wand2 className="w-6 h-6 mr-2 text-purple-400" />
            AI Cast Generator
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Generate engaging casts with AI
          </p>
        </div>
        <div className="text-center">
          <div className="bg-purple-800 rounded-lg px-2 py-1.5 border border-purple-600">
            <p className="text-purple-200 text-xs">Daily Credits</p>
            <p className="text-white text-sm font-bold">5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHeader;
