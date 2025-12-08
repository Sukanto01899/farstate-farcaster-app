import { StatusType } from "@/hooks/useAiLimitStatus";
import { Sparkles, Wand2 } from "lucide-react";
import React from "react";
import { useState } from "react";
import ProModal from "./ProModal";

type HeaderProps = {
  status: StatusType | undefined;
  isStatusLoading: boolean;
};

const CreateHeader = ({ status, isStatusLoading }: HeaderProps) => {
  const [showProModal, setShowProModal] = useState(false);

  console.log(status);
  return (
    <div className="bg-purple-800 rounded-2xl p-2  shadow-xl">
      <div className="flex flex-col justify-center items-center">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-white text-lg font-bold flex items-center">
            <Wand2 className="w-6 h-6 mr-2 text-purple-400" />
            AI Cast Generator
          </h2>

          <button
            onClick={() => setShowProModal(true)}
            className="py-1 px-2 bg-purple-900 text-white rounded-2xl text-sm hover:bg-purple-600"
          >
            Get Pro
          </button>
        </div>

        <div className="flex justify-around items-center w-full mt-2">
          <div className="bg-purple-800 rounded-lg px-2 py-1.5 border border-purple-600">
            <p className="text-purple-200 text-xs">Daily Cast</p>
            <p
              className={`${
                status?.text_remaining ? "text-white" : "text-red-400"
              }  text-sm font-bold text-center`}
            >
              {isStatusLoading
                ? "Loading..."
                : status && `${status?.text_used}/${status?.text_limit}`}
            </p>
          </div>
          <div className="bg-purple-800 rounded-lg px-2 py-1.5 border border-purple-600">
            <p className="text-purple-200 text-xs">Daily Thumbnail</p>
            <p
              className={`${
                status?.image_remaining ? "text-white" : "text-red-400"
              } text-sm font-bold text-center`}
            >
              {isStatusLoading
                ? "Loading..."
                : status && `${status?.image_used}/${status?.image_limit}`}
            </p>
          </div>
          <div className="bg-purple-800 rounded-lg px-2 py-1.5 border border-purple-600">
            <p className="text-purple-200 text-xs">Your Tier</p>
            <p className="text-white text-sm font-bold text-center">
              {status && status?.tier.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {showProModal && <ProModal setShowProModal={setShowProModal} />}
    </div>
  );
};

export default CreateHeader;
