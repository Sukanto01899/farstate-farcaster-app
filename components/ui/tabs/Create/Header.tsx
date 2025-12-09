import { StatusType } from "@/hooks/useAiLimitStatus";
import { Loader, Sparkles, Wand2 } from "lucide-react";
import React from "react";
import { useState } from "react";
import ProModal from "./ProModal";

type HeaderProps = {
  status: StatusType | undefined;
  isStatusLoading: boolean;
  refetchStatus: () => void;
};

const CreateHeader = ({
  status,
  isStatusLoading,
  refetchStatus,
}: HeaderProps) => {
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

          {status && status?.tier === "pro" ? (
            <span className="bg-purple-900 py-1 px-2 rounded-2xl text-sm text-orange-400 font-semibold">
              Pro
            </span>
          ) : (
            <button
              onClick={() => setShowProModal(true)}
              className="py-1 px-2 bg-purple-900 text-white rounded-2xl text-sm hover:bg-purple-600"
            >
              Get Pro
            </button>
          )}
        </div>

        <div className="flex justify-around items-center w-full mt-2 bg-purple-900 py-2 rounded-xl">
          <div className="">
            <p className="text-purple-200 text-xs">Daily Cast</p>
            <p
              className={`${
                status?.text_remaining ? "text-white" : "text-red-400"
              }  text-sm font-bold text-center`}
            >
              {isStatusLoading ? (
                <Loader className="animate-spin mx-auto text-white" size={20} />
              ) : (
                status && `${status?.text_used}/${status?.text_limit}`
              )}
            </p>
          </div>
          <div className="">
            <p className="text-purple-200 text-xs">Daily Thumbnail</p>
            <p
              className={`${
                status?.image_remaining ? "text-white" : "text-red-400"
              } text-sm font-bold text-center`}
            >
              {isStatusLoading ? (
                <Loader className="animate-spin mx-auto text-white" size={20} />
              ) : (
                status && `${status?.image_used}/${status?.image_limit}`
              )}
            </p>
          </div>
          <div className="">
            <p className="text-purple-200 text-xs">Your Tier</p>
            <p className="text-white text-sm font-bold text-center">
              {isStatusLoading ? (
                <Loader className="animate-spin mx-auto text-white" size={20} />
              ) : (
                status && status?.tier.toUpperCase()
              )}
            </p>
          </div>
        </div>
      </div>

      {showProModal && (
        <ProModal
          setShowProModal={setShowProModal}
          refetchStatus={refetchStatus}
        />
      )}
    </div>
  );
};

export default CreateHeader;
