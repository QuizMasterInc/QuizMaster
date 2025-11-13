import { useRef, useEffect } from 'react'

function QuestionAmount ({ min, max , amount, updateAmount}) {
    const inputRef = useRef(null)
  
    const handleInputChange = (e) => {
      const inputValue = parseInt(e.target.value, 10)
      updateAmount(isNaN(inputValue) ? '' : inputValue)
    }
  
  
    const handleEnterKey = () => {
      let newValue = parseInt(inputRef.current.value, 10)
      newValue = Math.min(Math.max(newValue, min), max)
      updateAmount(isNaN(newValue) ? '' : newValue)
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
          className="mt-2 p-2 w-16 text-center border-2 border-accent text-black rounded-lg"
          value={amount}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleEnterKey()}
          ref={inputRef}
          min={min}
          max={max}
          pattern="[0-9]*"
        />
      </div>
    )
  }

export default QuestionAmount;