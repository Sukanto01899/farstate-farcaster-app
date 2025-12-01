import { castCategories } from "@/lib/constants";
import { Edit } from "lucide-react";
import React from "react";

type SelectCategoryProps = {
  setSelectedCategory: (val: string | null) => void;
  selectedCategory: string | null;
  setShowCustomCommandInput: (val: boolean) => void;
  showCustomCommandInput: boolean;
};

const SelectCategory = ({
  setSelectedCategory,
  selectedCategory,
  setShowCustomCommandInput,
  showCustomCommandInput,
}: SelectCategoryProps) => {
  const handleSelectCategory = (category: string) => {
    if (showCustomCommandInput) {
      setShowCustomCommandInput(false);
    }
    setSelectedCategory(category);
  };

  const handleCustomCommandShow = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    }

    setShowCustomCommandInput(true);
  };
  return (
    <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-xl">
      <h3 className="text-white text-base font-bold mb-3">Choose Category</h3>

      <div className="grid grid-cols-1 gap-2 pb-2">
        <div className="grid grid-cols-2 gap-2">
          {castCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelectCategory(category.name)}
              className={`${
                category.color
              } border rounded-lg p-2 transition-all hover:scale-105 flex-shrink-0 min-w-[110px] ${
                selectedCategory === category.name
                  ? "ring-2 ring-purple-400 "
                  : ""
              }`}
            >
              <category.icon className="w-5 h-5 text-white mx-auto mb-1" />
              <p className="text-white text-xs font-semibold text-center">
                {category.name}
              </p>
            </button>
          ))}
        </div>
        <button
          onClick={() => handleCustomCommandShow()}
          className={`${
            showCustomCommandInput && "ring-2 ring-purple-400"
          } border rounded-lg p-2 transition-all hover:scale-105 flex-shrink-0 min-w-[110px] `}
        >
          <Edit className="w-5 h-5 text-white mx-auto mb-1" />
          <p className="text-white text-xs font-semibold text-center">Custom</p>
        </button>
      </div>
    </div>
  );
};

export default SelectCategory;
