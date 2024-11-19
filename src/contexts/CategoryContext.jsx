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
    'geography': ['world', 'americas'],
    'science': ['biology', 'chemistry', 'astronomy'],
    'sports': ['soccer', 'basketball', 'football'],
    'entertainment': ['tv', 'music', 'movies'],
    'mathematics': ['algebra', 'geometry'],
    'history': ['global','america'],
  
  })
  // TODO: add questions for history and sports sections
  //quiz categories. order matters!
  const [quizCategories] = useState([
      'Geography',
      'Science',
      'Sports',
      'Entertainment',
      'Mathematics',
      'History'
    ]);
    
    // TODO: add icons back in once questions are added
    //icons for each quiz category. order matters!
  const [icons] = useState([
    <World className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <FlaskVial className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <Basketball className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <Ticket className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <Calculator className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
    <Book className={"w-10 h-10 fill-gray-300 -sm:w-8 -sm:h-8"}/>
  ]);

  // TODO: add questions for history and sports sections
  //destinations for each category. order matters!
  const [destinations] = useState([
    'geography',
    'science',
    'sports',
    'entertainment',
    'mathematics',
    'history'
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
  const [duration, setDuration] = useState(
    sessionStorage.getItem('duration') || 5 // Default duration is 5 minutes
  );
  const [showTimer, setShowTimer] = useState(true);

  const [showPauseButton, setPauseButton] = useState(true);

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

  useEffect(() => {
    sessionStorage.setItem('duration', duration);
  }, [duration]);

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

  //function to update duration of quiz
  const updateDuration = (newDuration) => {
    setDuration(newDuration);
  };

    // Function to toggle timer visibility
    const toggleTimerVisibility = () => {
      setShowTimer((prev) => !prev);
  };

    // Function to toggle timer visibility
    const togglePauseButtonVisibility = () => {
      setPauseButton((prev) => !prev);
  };


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
      duration :duration,
      showTimer: showTimer,
      showPauseButton: showPauseButton,

      selectCategory: selectCategory,
      toggleSubcategory: toggleSubcategory,
      allSubcategories: allSubcategories,
      selectDifficulty: selectDifficulty,
      selectAmount: selectAmount,
      updateDuration: updateDuration, 
      toggleTimerVisibility: toggleTimerVisibility,
      togglePauseButtonVisibility: togglePauseButtonVisibility,
  }

  //Context provider
  return(
      <CategoryContext.Provider value={categoryData}>
          {children}
      </CategoryContext.Provider>
  )
}

