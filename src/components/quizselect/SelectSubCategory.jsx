/**
 * This parent component will allow users to navigate to the various quizzes
 * based on the quiz category
 */
import React from 'react';
import { useCategory } from '../../contexts/CategoryContext';
import SubCategoryButton from './SubCategoryButton';
import QuizStartButton from './QuizStartButton';
import { Link } from 'react-router-dom';

function SelectSub() {

  const {quizSubcategories, category, toggleSubcategory, subcategories} = useCategory()

  console.log('Category: ', category)
  console.log('SubCategories: ', quizSubcategories)
  console.log('Subs: ', subcategories)
  
  //const availbleSubcategories = subcategories
  const availbleSubcategories = quizSubcategories[category.toLowerCase()]
  console.log('Available: ', availbleSubcategories)
  
  /**
   * Select subcategory page
   */
  return (
    <>
      <div className="flex flex-col items-center h-full mb-4 -xl:ml-20 -xl:w-3/4">
        <h2 className="text-2xl font-bold text-gray-300">Choose Your Sub-Categories</h2>
        <div className="flex flex-wrap justify-center">
          {availbleSubcategories.map((category) => (
            <SubCategoryButton category={category} toggleSubcategory={toggleSubcategory} isSelected={true}/>
          ))}
          <QuizStartButton category={"Start"} destination={"quizstarted"}/>
        </div>
      </div>
    </>
  );
};

export default SelectSub;