import { Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import GenerateButton from "./GenerateButton";
import useCreateCast from "@/hooks/useCreateCast";
import PostCast from "./PostCast";
import SelectCategory from "./SelectCategory";
import CreateHeader from "./Header";
import useAiLimitStatus from "@/hooks/useAiLimitStatus";

const CreateTab = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showCustomCommandInput, setShowCustomCommandInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status, isStatusLoading, refetchStatus } = useAiLimitStatus();

  const {
    isCastCreating,
    castData,
    generateCast,
    isCastCreatingError,
    castCreatingError,
    generateThumbnail,
    thumbnail,
    isThumbnailCreating,
    isThumbnailCreatingError,
  } = useCreateCast();

  useEffect(() => {
    if (castCreatingError) {
      console.log(castCreatingError);
    }
  }, [castCreatingError]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Create Cast Header */}
      <CreateHeader status={status} isStatusLoading={isStatusLoading} />

      {/* Generated Cast Preview */}
      <PostCast
        generateThumbnail={generateThumbnail}
        castData={castData}
        isCastCreating={isCastCreating}
        isThumbnailCreating={isThumbnailCreating}
        thumbnail={thumbnail}
        refetchStatus={refetchStatus}
        status={status}
      />
      {/* Category Slider */}
      <SelectCategory
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        setShowCustomCommandInput={setShowCustomCommandInput}
        showCustomCommandInput={showCustomCommandInput}
      />

      {/* Custom Prompt */}
      {showCustomCommandInput && (
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-xl">
          <h3 className="text-white text-base font-bold mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
            Custom Prompt
          </h3>
          <div className="space-y-2">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the cast you want to generate..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none"
              rows={3}
            />
          </div>
        </div>
      )}
      {/* Generate button */}
      <GenerateButton
        selectedCategory={selectedCategory}
        customPrompt={customPrompt}
        isCustomCommandActive={showCustomCommandInput}
        setError={setError}
        generateCast={generateCast}
        generateThumbnail={generateThumbnail}
        isCastCreating={isCastCreating}
        castCreatingError={castCreatingError}
        setCustomPrompt={setCustomPrompt}
        refetchStatus={refetchStatus}
        isThumbnailCreating={isThumbnailCreating}
        castData={castData}
      />
    </div>
  );
};

export default CreateTab;
