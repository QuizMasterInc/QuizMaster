import React, { useState, useRef, useEffect } from 'react'

function QuestionAmount ({ min, max , amount, selectAmount}) {
    const inputRef = useRef(null)
  
    const handleInputChange = (e) => {
      const inputValue = parseInt(e.target.value, 10)
      selectAmount(isNaN(inputValue) ? '' : inputValue)
    }
  
  
    const handleEnterKey = () => {
      let newValue = parseInt(inputRef.current.value, 10)
      newValue = Math.min(Math.max(newValue, min), max)
      selectAmount(isNaN(newValue) ? '' : newValue)
      console.log('Handled enter')
    }
  
    useEffect(() => {
      const handleOutsideClick = (e) => {
        if (inputRef.current && !inputRef.current.contains(e.target)) {
          handleEnterKey()
        }
      }
  
      window.addEventListener('click', handleOutsideClick)
  
      return () => {
        window.removeEventListener('click', handleOutsideClick)
      }
    }, [])
  
    return (
      <div className="flex items-center space-x-2">
        <input
          type="number"
          className="w-16 text-center border border-gray-300 bg-gray-800 text-gray-300 mt-4"
          value={amount}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleEnterKey()}//Handle enter
          ref={inputRef}
          min={min}
          max={max}
          pattern="[0-9]*" //Prevent non integer inputs
        />
      </div>
    )
  }

export default QuestionAmount
