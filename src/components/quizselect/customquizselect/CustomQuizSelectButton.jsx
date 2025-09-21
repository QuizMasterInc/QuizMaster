/**
 * This component hosts a button to click for each custom quiz
 */
import React, {useState, useEffect} from "react"
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database"; 

const CustomQuizSelectButton = ({title, numQuestions, tags, uid, quizPassword, creator}) => {

  const { currentUser } = useAuth();
  const navigate = useNavigate()
  const [quizPasswordAttempt, setQuizPasswordAttempt] = useState("")
  // const [quizPasswordAttemptCheck, setQuizPasswordAttemptCheck] = useState()
  const [creatorInfo, setCreatorInfo] = useState(null);

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      try {
        const db = getDatabase();
        const creatorRef = ref(db, 'users/' + creator);  // 'creator' is the user ID

        // Fetch user info from the database using the creator ID
        const creatorSnapshot = await get(creatorRef);

        if (creatorSnapshot.exists()) {
          const data = creatorSnapshot.val();
          setCreatorInfo(data);  // Set the creator info to state
        } else {
          setCreatorInfo(null);  // Set to null if no data exists
        }
      } catch (error) {
        console.error("Error fetching creator info:", error);
      }
    };

    if (creator) {
      fetchCreatorInfo();  // Only fetch if creator ID exists
    }
  }, [creator]);  // Dependency on 'creator' to refetch if creator changes



  function displayCreatorName() {
    return "Created By: " + creator;
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
          <div className="card rounded-lg shadow-lg hover:shadow-xl border border-accent">
              <div className="text-2xl text-[var(--primary-500)]">{title}</div>
              <div className="text-base">{displayCreatorName()}</div>
              <div className="text-base">{displayTags(tags)}</div>
              <div className="text-base">Questions: {numQuestions}</div>
              <input 
                type="text"
                placeholder='Enter Quiz Password'
                className='text-xl text-black mb-4 bg-gray-300 rounded-md w-full p-1'
                id="quizPasswordAttempt"
                value={quizPasswordAttempt}
                onChange={(e) => handleQuizPasswordChange(e)}
              />
              <div>
                  <button 
                  className="inline-block px-4 py-1 bg-[var(--primary-400)] rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-accent"
                  onClick={() => quizPasswordCheck(quizPasswordAttempt, quizPassword)}>
                    Start
                  </button>
              </div>
              
          </div>
          :
          <Link to={'/quizstarted/' + uid}>
            <div className="card rounded-lg shadow-lg hover:shadow-xl border border-accent">
              <div className="text-2xl text-[var(--primary-500)]">{title}</div>
              <div className="text-base">{displayCreatorName()}</div>
              <div className="text-base">{displayTags(tags)}</div>
              <div className="text-base">Questions: {numQuestions}</div>
            </div>
          </Link>
          }
          
      </div>
    )
}

export default CustomQuizSelectButton;