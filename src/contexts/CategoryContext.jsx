import React, { useContext, useState } from "react";
import { createContext } from "react";
import Book from "../components/icons/Book";
import World from "../components/icons/World";
import FlaskVial from "../components/icons/FlaskVial";
import Basketball from "../components/icons/Basketball";
import Ticket from "../components/icons/Ticket";
import Calculator from "../components/icons/Calculator";

const CategoryContext = React.createContext()

export function useCategory() {
    return useContext(CategoryContext)
}

export function CategoryProvider({children}){
    const [quizCategories] = useState([
        'History',
        'Geography',
        'Science',
        'Sports',
        'Entertainment',
        'Mathematics'
      ]);
    
      const [icons] = useState([
        <Book className={"w-10 h-10 fill-gray-300 -sm:w-8 -sm:h-8"}/>,
        <World className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
        <FlaskVial className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
        <Basketball className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
        <Ticket className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>,
        <Calculator className={"w-10 h-10 fill-gray-300  -sm:w-8 -sm:h-8"}/>
      ]);
    
      const [destinations] = useState([
        'history',
        'geography',
        'science',
        'sports',
        'entertainment',
        'mathematics'
      ]);
    const categoryData = {
        quizCategories: quizCategories,
        icons: icons,
        destinations: destinations   
    }

    return(
        <CategoryContext.Provider value={categoryData}>
            {children}
        </CategoryContext.Provider>
    )
}

