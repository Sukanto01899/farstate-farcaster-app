import useCreateCast from "@/hooks/useCreateCast";
import { castCategories } from "@/lib/constants";
import { MutateFunction } from "@tanstack/react-query";
import { Loader, Wand2 } from "lucide-react";
import React, { useEffect } from "react";

type GenerateButtonProps = {
  selectedCategory: string | null;
  customPrompt: string;
  isCustomCommandActive: boolean;
  setError: (val: string | null) => void;
  generateCast: MutateFunction<any, any, string>;
  isCastCreating: boolean;
  castCreatingError: Error | null;
  setCustomPrompt: (val: string) => void;
};

const GenerateButton = ({
  selectedCategory,
  customPrompt,
  isCustomCommandActive,
  setError,
  generateCast,
  isCastCreating,
  castCreatingError,
  setCustomPrompt,
}: GenerateButtonProps) => {
  const handleGenerateCast = async () => {
    setError(null);
    if (isCustomCommandActive) {
      if (!customPrompt || customPrompt.length < 3) {
        return setError("Write a command!");
      }
      await generateCast(customPrompt);
      setCustomPrompt("");
    } else if (selectedCategory) {
      await generateCast(selectedCategory);
    }
  };

  const parsedError =
    castCreatingError && JSON.parse(castCreatingError.message);

  return (
    <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-xl">
      <button
        onClick={() => handleGenerateCast()}
        disabled={isCastCreating || (!selectedCategory && !customPrompt)}
        className={`w-full ${
          (selectedCategory === null && !customPrompt) || isCastCreating
            ? "bg-purple-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700"
        } text-white text-sm font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2`}
      >
        {isCastCreating ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        <span>{isCastCreating ? "Generating..." : "Generate Cast"}</span>
      </button>

      {castCreatingError && (
        <p className="text-center text-sm text-red-500 mt-1">
          {parsedError?.error}
        </p>
      )}
    </div>
  );
};

export default GenerateButton;
