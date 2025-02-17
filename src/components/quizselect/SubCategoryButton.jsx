/**
 * This component hosts a button to click for each quiz category
 */
import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const SubCategoryButton = ({ category, toggleSubcategory, isSelected }) => {
  const handleClick = () => {
    toggleSubcategory(category);
  };

  const buttonColor = isSelected
    ? "bg-blue-900 cursor-pointer"
    : "bg-gray-800 hover:shadow-xl hover:bg-gray-600 cursor-pointer";

  return (
    <div className="w-1/2 p-4 text-center -sm:p-1" onClick={handleClick}>
      <div
        className={`flex flex-col items-center p-4 space-y-4 text-gray-300 rounded-lg shadow-lg ${buttonColor}`}
      >
        <div className="-sm:text-sm flex items-center gap-2">
          {category}
          {isSelected ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubCategoryButton;
