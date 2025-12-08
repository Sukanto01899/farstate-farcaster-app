import { StatusType } from "@/hooks/useAiLimitStatus";
import { CastData, ThumbnailData } from "@/hooks/useCreateCast";
import useShareCast from "@/hooks/useShareCast";
import { MutateFunction } from "@tanstack/react-query";
import { Image, Loader, Send } from "lucide-react";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";

type PostCastProps = {
  castData: CastData | undefined;
  isCastCreating: boolean;
  generateThumbnail: MutateFunction<any, any, string>;
  isThumbnailCreating: boolean;
  thumbnail: ThumbnailData | undefined;
  refetchStatus: () => void;
  status: StatusType | undefined;
};

const PostCast = ({
  castData,
  isCastCreating,
  generateThumbnail,
  isThumbnailCreating,
  thumbnail,
  refetchStatus,
  status,
}: PostCastProps) => {
  const { handleShare, isProcessing } = useShareCast();
  const [dataUrl, setDataUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const handlePostCast = async () => {
    try {
      await handleShare(
        { text: castData?.cast, embeds: thumbnail && [thumbnail?.imageUrl] },
        false
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!castData) return;
    try {
      await generateThumbnail(castData.cast, {
        onSuccess: () => {
          toast.success("Thumbnail Created");
        },
        onError: () => {
          toast.error("Failed to Generate");
        },
      });
      refetchStatus();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (thumbnail) {
      setThumbnailUrl(thumbnail.imageUrl);
    }
  }, [thumbnail]);
  useEffect(() => {
    if (isCastCreating) {
      setThumbnailUrl("");
    }
  }, [isCastCreating]);

  useEffect(() => {
    // When a new cast finishes generating, bring the user back to the top
    if (!isCastCreating && castData && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [castData, isCastCreating]);

  const isImageLimitAvailable = status && !!status.image_remaining;

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
            {isThumbnailCreating && (
              <div className="w-full h-24 mb-3 rounded-2xl font-semibold bg-slate-400 animate-pulse flex justify-center items-center text-purple-800">
                Thumbnail creating...
              </div>
            )}
            {thumbnailUrl && !isThumbnailCreating && (
              <div className="w-full min-h-32 bg-slate-300 overflow-hidden mb-3 rounded-2xl">
                <img
                  src={thumbnailUrl}
                  alt="Generated thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isThumbnailCreating || !isImageLimitAvailable}
                onClick={handleGenerateThumbnail}
                className={`${
                  isThumbnailCreating || !isImageLimitAvailable
                    ? "cursor-not-allowed bg-indigo-400  "
                    : "bg-indigo-600"
                }  text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5`}
              >
                {isThumbnailCreating && !thumbnail ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Image />
                )}
                <span>
                  {isImageLimitAvailable
                    ? isThumbnailCreating
                      ? "Creating..."
                      : "Thumbnail"
                    : "Limit Reached"}
                </span>
              </button>
              <button
                onClick={handlePostCast}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5"
              >
                {isProcessing ? (
                  <Loader className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isProcessing ? "Casting..." : "Post Cast"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    )
  );
};

export default PostCast;
