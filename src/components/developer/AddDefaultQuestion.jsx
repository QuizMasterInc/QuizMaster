import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link, Navigate } from 'react-router-dom'



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
    const quizAttributes = ['a', 'b', 'c', 'd', 'correct', 'category', 'sub-category']
    const placeholders = ['a', 'b', 'c', 'd', 'Correct answer', 'Category: e.g. history', 'Sub-category: e.g. ancient']

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
    const inputField = ({ key, placeholder }) => {
        console.log('Key:', key)
        return (
            <input
                id={key}
                type="text"
                placeholder={placeholder}
                value={question[key]}
                onChange={(e) => updateQuestion(key, e.target.value)}
                className='text-2xl mb-4 rounded-md w-full h-10 focus:scale-110 duration-300'
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
                            Add to default Quizzes!
                        </h1>
                        <div className='w-full'>
                            <div name="questions">
                                <h1 className='font-bold text-gray-300 text-2xl mb-10'>Type Your Question</h1>
                                {inputField({ key: "question", placeholder: "Enter your question" })}
                            </div>

                            <div name="question-attributes" >
                                <h1 className='font-bold text-gray-300 text-2xl mb-8'>Add Quiz Attributes</h1>
                                {quizAttributes.map((key, index) => (
                                    <div key={key}>
                                        {inputField({ key: key, placeholder: placeholders[index] })}
                                    </div>
                                ))}
                                <div key='difficulty'>
                                    <input
                                        id='difficulty'
                                        type='number'
                                        value={question['difficulty']}
                                        onChange={(e) => updateQuestion('difficulty', e.target.value)}
                                        className='text-2xl mb-4 rounded-md w-full h-10 focus:scale-110 duration-300'
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