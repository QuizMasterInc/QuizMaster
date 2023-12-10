import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link, Navigate } from 'react-router-dom'

// TODO: add two check marks to retain both category and subcategory on submit

const AddDefaultQuestion = ({ index, category, icon, destination, selectCategory, allSubcategories }) => {
    const { currentUser } = useAuth(); // Get the current user from your context.
    /*
    useEffect(() => {
        // Check if the user has the "developer" role when the component loads.
        if (currentUser && currentUser.role !== 'developer') {
        // Redirect the user to another page (e.g., unauthorized page).
        // You can also use window.location.replace to block the access entirely.
        window.location.replace('/404');
        }
    }, [currentUser]);
    */
    const { logout, isGoogleAuth } = useAuth()
    const [loading, setLoading] = useState(true)
    const [question, setQuestion] = useState({
        a: '',
        b: '',
        c: '',
        d: '',
        correct: '',
        category: '',
        difficulty: 0,// null,
        question: '',
        'sub-category': ''
    })
    const quizAttributes = ['a', 'b', 'c', 'd', 'category', 'sub-category']
    const placeholders = ['a', 'b', 'c', 'd', 'Category: e.g. history', 'Sub-category: e.g. ancient']

    const [isQuizAdded, setIsQuizAdded] = useState(false);

    const updateQuestion = (key, value) => {
        // Create a copy of the currentQuestion object with the updated field
        setQuestion((prev) => ({
            ...prev,
            [key]: value
        }));
    };
    //Reset question to default values
    const resetQuestion = () => {
        setQuestion({
            a: '',
            b: '',
            c: '',
            d: '',
            correct: '',
            category: '',
            difficulty: 0, // or null, depending on your preference
            question: '',
            'sub-category': ''
          })
    }
    //Generate generic input field and updates question
    const inputField = ({ key, placeholder, className }) => {
        console.log('Key:', key)
        return (
            <input
                id={key}
                type="text"
                placeholder={placeholder}
                value={question[key]}
                onChange={(e) => updateQuestion(key, e.target.value)}
                className= {className.concat(' ', 'text-2xl mb-4 rounded-md h-7 p-4 focus:scale-110 duration-300')}
            />
        )
    }
    //Add question to default quizzes
    async function addDefaultQuestion() {

        const encodedQuestion = encodeURIComponent(JSON.stringify(question));
        await fetch(`https://us-central1-quizmaster-c66a2.cloudfunctions.net/addDefaultQuestion?question=${encodedQuestion}`)
        console.log('Added Question!')
        // Display the text when the question is added
        setIsQuizAdded(true);

        // Hide the text after 2000 milliseconds (adjust as needed)
        setTimeout(() => {
        setIsQuizAdded(false);
        }, 20000);
        resetQuestion()

    }
    return (
        <>
            <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl space-y-8 -sm:ml-10">
                    <div className='flex flex-col items-center justify-center'>
                        <h1 className="text-3xl font-bold text-gray-300 mb-10">
                            Add to Default Quizzes!
                        </h1>
                        <div className='w-full'>
                            <div name="questions">
                                <h1 className='font-bold text-gray-300 text-2xl mb-10'>Type Your Question</h1>
                                {inputField({ key: "question", placeholder: "Enter your question", className: "w-full" })}
                            </div>

                            <div name="question-attributes" >
                                <h1 className='font-bold text-gray-300 text-2xl mb-8'>Add Quiz Attributes</h1>
                                
                                {quizAttributes.map((key, index) => (
                                    <div key={key} className="grid grid-cols-3 gap-10">
                                        <span className='font-med text-gray-300 text-l col-span-1 text-right h-10'>{quizAttributes[index].toLowerCase()} (value): </span>
                                        {inputField({ key: key, placeholder: placeholders[index], className: "col-span-2"})}
                                    </div>
                                ))}

                                
                                <hr className='pt-4'></hr>
                                <div key='correct' className="grid grid-cols-3 gap-10 pb-4">
                                <span className='col-span-1 font-med text-gray-300 text-l h-10 text-right'>correct [option] val: <br></br> 
                                <span className='text-gray-400 text-sm'>(will autopopulate with a-d)</span> </span>
                                    <input
                                        id='correct'
                                        value={question['correct']}
                                        onChange={(e) => updateQuestion('correct', e.target.value)}
                                        className='col-span-2 text-2xl mb-2 mt-2 rounded-md h-7 p-4 focus:scale-110 duration-300'
                                        list='option-list'
                                    />
                                    <datalist
                                        id='option-list'>
                                            <option value={question['a']}>
                                            {"a. ".concat(question['a'])}
                                        </option>
                                        <option value={question['b']}>
                                            {"b. ".concat(question['b'])}
                                        </option>
                                        <option value={question['c']}>
                                            {"c. ".concat(question['c'])}
                                        </option>
                                        <option value={question['d']}>
                                            {"d. ".concat(question['d'])}
                                        </option>
                                    </datalist>
                                </div>

                                {/* Added a "correct val dropdown" to help ensure there are no more typos in our "correct" field */}
                                <div key='correct-2' className="grid grid-cols-3 gap-10 pb-4">
                                <span className='col-span-1 font-med text-gray-300 text-l h-10 text-right'>correct [dropdown] val: <br></br> 
                                <span className='text-gray-400 text-sm'>(will autopopulate with a-d)</span> </span>
                                    <select
                                        name='correct-2'
                                        type='string'

                                        /*  unsure why placeholder and value does nothing, 
                                            otherwise I'd be able to totally replace the current 
                                            "correct (value)" field with this
                                        */
                                        placeholder='Select Option'

                                        onChange={(e) => updateQuestion('correct', e.target.value)}
                                        className='col-span-2 text-2xl mb-2 mt-2 rounded-md h-7 p-4 focus:scale-110 duration-300'
                                        >
                                                                               
                                        <option value={question['a']}>
                                            {"a. ".concat(question['a'])}
                                        </option>
                                        <option value={question['b']}>
                                            {"b. ".concat(question['b'])}
                                        </option>
                                        <option value={question['c']}>
                                            {"c. ".concat(question['c'])}
                                        </option>
                                        <option value={question['d']}>
                                            {"d. ".concat(question['d'])}
                                        </option>
                                    </select>
                                </div>

                                <hr className='pt-4'></hr>
                                <div key='difficulty' className="grid grid-cols-3 gap-10">
                                <span className='col-span-1 font-med text-gray-300 text-l h-10 text-right'>difficulty value: <br></br> 
                                <span className='text-gray-400 text-sm'>(0 is easiest, 5 is hardest)</span> </span>
                                    <input
                                        id='difficulty'
                                        type='number'
                                        value={question['difficulty']}
                                        onChange={(e) => updateQuestion('difficulty', e.target.value)}
                                        className='col-span-2 text-2xl mb-2 mt-2 rounded-md h-7 p-4 focus:scale-110 duration-300'
                                        pattern="[0-9]*" //Prevent non integer inputs
                                        min={0}
                                        max={5}
                                    />
                                </div>

                                

                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-y-3 gap-x-3 -sm:gap-x-24'>
                            <button
                              onClick={addDefaultQuestion}
                              className='flex relative items-center justify-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                              Add Question
                            </button>
                            
                            <Link to={'/quizzes'}>
                            <div className='flex relative items-center justify-center mt-10 p-4 pl-8 pr-8 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 -md:ml-20'>
                                Take a premade quiz!
                            </div>
                            </Link>
                        {isQuizAdded && <p style={{ color: 'gold' }}>Question has been added!</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddDefaultQuestion;