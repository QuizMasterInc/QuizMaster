/**
 * This is the category context. It will share its state with any child component
 * You use these to wrap child components in order to get shared state throughout 
 * the application
 */
import React, { useContext, useState, useEffect } from "react";
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

// TODO: add questions for history and sports sections
export function CategoryProvider({children}){
  const [quizSubcategories] = useState({
    //'history': [],
    'geography': ['world', 'americas'],
    'science': ['biology', 'chemistry', 'astronomy'],
    'sports': ['Soccer', 'Basketball', 'Football'],
    'entertainment': ['tv', 'music', 'movies'],
    'mathematics': ['algebra', 'geometry'],
  
  })
  // TODO: add questions for history and sports sections
  //quiz categories. order matters!
  const [quizCategories] = useState([
      //'History',
      'Geography',
      'Science',
      'Sports',
      'Entertainment',
      'Mathematics'
    ]);
    
    // TODO: add icons back in once questions are added
    //icons for each quiz category. order matters!
  const [icons] = useState([
    //<Book className={"w-10 h-10 fill-gray-300 -sm:w-8 -sm:h-8"}/>,
    <World className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <FlaskVial className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <Basketball className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <Ticket className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <Calculator className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>
  ]);

  // TODO: add questions for history and sports sections
  //destinations for each category. order matters!
  const [destinations] = useState([
    //'history',
    'geography',
    'science',
    'sports',
    'entertainment',
    'mathematics'
  ]);

  const [category, setCategory] = useState(
    sessionStorage.getItem('category') || ''
  )
  const [subcategories, setSubcategories] = useState(
    JSON.parse(sessionStorage.getItem('subcategories')) || []
  )
  const [difficulty, setDifficulty] = useState(
    sessionStorage.getItem('difficulty') || ''
  )
  const [amount, setAmount] = useState(
    sessionStorage.getItem('amount') || ''
  )
  //Update sessionStorage whenever category or subcategories change
  useEffect(() => {
    sessionStorage.setItem('category', category);
  }, [category])

  useEffect(() => {
    sessionStorage.setItem('subcategories', JSON.stringify(subcategories));
  }, [subcategories])

  useEffect(() => {
    sessionStorage.setItem('difficulty', difficulty);
  }, [difficulty])

  useEffect(() => {
    sessionStorage.setItem('amount', amount);
  }, [amount])

  //Change category
  const selectCategory = (category) => {
    setCategory(category)
  }

  //Add/remove subcategories
  const toggleSubcategory = (subcategory) => {
    if (subcategories.includes(subcategory)) {
      //Subcategory is already selected, so remove it
      setSubcategories((curr) =>
        curr.filter((item) => item !== subcategory)
      )
    } else {
      //Subcategory is not selected, so add it
      setSubcategories((curr) => [...curr, subcategory]);
    }
  }

  //Add all subcategories
  const allSubcategories = (category) => {
    setSubcategories(quizSubcategories[category.toLowerCase()])
  }

  //Change difficulty
  const selectDifficulty = (difficulty) => {
    setDifficulty(difficulty)
  }

  //Change amount
  const selectAmount = (amount) => {
    setAmount(amount)
  }

  //packages data
  const categoryData = {
      quizCategories: quizCategories,
      icons: icons,
      destinations: destinations,
      quizSubcategories: quizSubcategories,

      //User selected
      category: category,
      subcategories: subcategories,
      difficulty: difficulty,
      amount: amount,
      selectCategory: selectCategory,
      toggleSubcategory: toggleSubcategory,
      allSubcategories: allSubcategories,
      selectDifficulty: selectDifficulty,
      selectAmount: selectAmount
  }

  //Context provider
  return(
      <CategoryContext.Provider value={categoryData}>
          {children}
      </CategoryContext.Provider>
  )
}

