import { useFrame } from "@/components/providers/farcaster-provider";
import { CastData } from "@/hooks/useCreateCast";
import { Image, Send } from "lucide-react";
import React from "react";

type PostCastProps = {
  castData: CastData | undefined;
  isCastCreating: boolean;
};

const PostCast = ({ castData, isCastCreating }: PostCastProps) => {
  const { actions } = useFrame();

  const handlePostCast = async () => {
    try {
      actions?.composeCast({
        text: castData?.cast,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    (castData || isCastCreating) && (
      <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-xl animate-fadeIn">
        <h3 className="text-white text-base font-bold mb-3">Generated Cast</h3>

        {isCastCreating ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex space-x-2">
              <div
                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 mb-3">
              <p className="text-white text-sm leading-relaxed">
                {castData?.cast}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled
                className="bg-indigo-400 cursor-not-allowed  text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Image className="w-4 h-4" />
                <span>Thumbnail</span>
                <span className="text-xs">(Coming)</span>
              </button>
              <button
                onClick={handlePostCast}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Post Cast</span>
              </button>
            </div>
          </>
        )}
      </div>
    )
  );
};

export default PostCast;
