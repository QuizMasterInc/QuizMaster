/**
 * This component hosts a button to click for each quiz category
 */
import React, { useState } from "react";

const SubCategoryButton = ({category, toggleSubcategory}) => {
    console.log('Category:', category)
    const [isSelected, setIsSelected] = useState(true);
    const handleClick = () => {
        console.log('Wazoo')
        toggleSubcategory(category)
        setIsSelected(!isSelected)
        
    }
    const buttonColor = isSelected ?  'bg-blue-900 cursor-pointer' : 'bg-gray-800 hover:shadow-xl hover:bg-gray-600 cursor-pointer'
    return (
        <div className="w-1/2 p-4 text-center -sm:p-1" onClick={handleClick}>
            <div
                className={`flex flex-col items-center p-4 space-y-4 text-gray-300 rounded-lg shadow-lg ${buttonColor}`}
            >
                <div className="-sm:text-sm">{category}</div>
            </div>
        </div>
  )
}

export default SubCategoryButton