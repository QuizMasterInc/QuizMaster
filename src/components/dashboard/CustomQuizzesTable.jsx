import React, { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { useAuth } from '../../contexts/AuthContext'
import Q from '../icons/Q'

const CustomQuizzesTable = () => {
    const [customQuizzes, updateCustomQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingColor, setLoadingColor] = useState("d1d5db")
    const {currentUser} = useAuth()
    const Qicon = useState(<Q className={"w-10 h-10 fill-gray-300 -sm:w-8 -sm:h-8"}/>,)

    // TODO: include firebase function to grab custom quiz results

    return(
    <div className="w-1/2 p-4 text-center -sm:p-1">
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
            <div className="-m:text-m">{'Custom Quiz Name'}</div>
            <div>{Qicon}</div>
        </div>
    </div>
    )
}

export default CustomQuizzesTable