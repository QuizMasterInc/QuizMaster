/**
 * This is the category context. It will share its state with any child component
 * You use these to wrap child components in order to get shared state throughout 
 * the application
 */
import React, { useContext, useState } from "react";
import Book from "../components/icons/Book";
import World from "../components/icons/World";
import FlaskVial from "../components/icons/FlaskVial";
import Basketball from "../components/icons/Basketball";
import Ticket from "../components/icons/Ticket";
import Calculator from "../components/icons/Calculator";

//creating context
const CategoryContext = React.createContext()

/**
 * This creates the useContext
 * @returns the useContext to be used in other components
 */
export function useCategory() {
    return useContext(CategoryContext)
}

export function CategoryProvider({children}){
  //quiz categories. order matters!
  const [quizCategories] = useState([
      'History',
      'Geography',
      'Science',
      'Sports',
      'Entertainment',
      'Mathematics'
    ]);
    
    //icons for each quiz category. order matters!
    const [icons] = useState([
      <Book className={"w-10 h-10 fill-gray-300 -sm:w-8 -sm:h-8"}/>,
      <World className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
      <FlaskVial className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
      <Basketball className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
      <Ticket className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
      <Calculator className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>
    ]);
  
    //destinations for each category. order matters!
    const [destinations] = useState([
      'history',
      'geography',
      'science',
      'sports',
      'entertainment',
      'mathematics'
    ]);

  //packages data
  const categoryData = {
      quizCategories: quizCategories,
      icons: icons,
      destinations: destinations   
  }

  //Context provider
  return(
      <CategoryContext.Provider value={categoryData}>
          {children}
      </CategoryContext.Provider>
  )
}

