/**
 * This component hosts a button to click for each custom quizz
 */
import React, {useState, useEffect} from "react"
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database"; 



const CustomQuizSelectButton = ({title, numQuestions, tags, uid, quizPassword}) => {

const { currentUser } = useAuth();
const navigate = useNavigate()
const [quizPasswordAttempt, setQuizPasswordAttempt] = useState("")
// const [quizPasswordAttemptCheck, setQuizPasswordAttemptCheck] = useState()
const [creatorInfo, setCreatorInfo] = useState(null);

// Fetch creator info based on creatorID (uid) (WORKS BUT NOT ALL USERS HAVE THE DISPLAY NAME LABEL IN FB)
useEffect(() => {
  const fetchCreatorInfo = async () => {
    const db = getDatabase();
    const creatorRef = ref(db, 'users/' + uid); 
    const creatorSnapshot = await get(creatorRef);
    if (creatorSnapshot.exists()) {
      setCreatorInfo(creatorSnapshot.val());  // Store creator's data in state
    } else {
      console.log("No creator info found!");
    }
  };

  if (uid) {
    fetchCreatorInfo();
  }
}, [uid]); 


function displayCreatorName() {
    if (creatorInfo && creatorInfo.displayName) {
        return "Created By: " + creatorInfo.displayName;
      }
      return "Created By: Unknown"; 
    }

function displayTags(tags) {
    if (tags != undefined && tags.length > 0) {
        return "User Tag(s): " + tags
    }
    return;
  }

const quizPasswordCheck = (quizPasswordAttempt, quizPassword)=> {
    if (quizPasswordAttempt == quizPassword) {
        navigate('/quizstarted/' + uid)
    } else {
        alert("Quiz Password is Incorrect!")
    }
}

const handleQuizPasswordChange = (e) => {
    setQuizPasswordAttempt((prevQuizPassword) => {
      let newPassword = prevQuizPassword;
      newPassword = e.target.value;
      console.log(newPassword)
      return newPassword
    })
  }



    return (<div className="w-1/2 p-5 text-center -sm:p-1">
        {quizPassword ? 
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl ">
            <div className="text-2xl">{title}</div>
            <div className="text-base">{displayCreatorName()}</div>
            <div className="text-base">{displayTags(tags)}</div>
            <div className="text-base">Questions: {numQuestions}</div>
            <input type="text"
            placeholder='Enter Quiz Password'
            className='text-xl text-black mb-4 bg-gray-300 rounded-md w-full'
            id="quizPasswordAttempt"
            value={quizPasswordAttempt}
            onChange={(e) => handleQuizPasswordChange(e)}
            />
            <div className="border-2 border-gray-600 w-3/4 rounded-lg hover:bg-gray-600 cursor-pointer" onClick={() => quizPasswordCheck(quizPasswordAttempt, quizPassword)}>
                Start
            </div>
            
        </div>
        :
        <Link to={'/quizstarted/' + uid}>
        <div className="flex flex-col items-center p-4 space-y-4 text-gray-300 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600">
            <div className="text-2xl">{title}</div>
            <div className="text-base">{displayTags(tags)}</div>
            <div className="text-base">Questions: {numQuestions}</div>
        </div>
        </Link>
        }
        
    </div>
    )
}
export default CustomQuizSelectButton;