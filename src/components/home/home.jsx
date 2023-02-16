import Logo from "../../assets/logo.jpg"
import Student from "../../assets/student.jpg";
import Quiz from "../../assets/quiz.png";


const Home = ({}) => (  
    <div className="pt-12 text-gray-300 bg-gray-800 shadow-lg hover:shadow-xl">
      <div className='flex'>
      <div className="flex items-center justify-center w-1/2">
        <img src={Logo} alt="logo" className="h-64 mx-auto w-76" />
      </div>
      <div class="w-1/2 ">
      <h1 className="mt-10 text-5xl font-bold text-gray-300 ">Welcome to QuizMaster</h1>
      <p className="pt-8 mb-10 text-2xl text-gray-300">The ultimate destination for all your quiz needs.</p>
      </div>
      </div>
      <div className='flex'>
        <div className="flex items-center justify-center w-1/2">
          <h1 className="pl-8 mt-10 text-3xl font-bold text-gray-300">Subjects ranging from Mathematics, Science, English, and More!</h1>
          <p className="pl-8 mt-10 text-2xl text-gray-300 ">The Perfect Quiz Taking Applicaiton for both Students and Teachers!</p>
        </div>
        <div class="w-1/2 ">
          <div className="flex items-center justify-center ">
          <img src={Student} alt="student" className="h-64 mx-auto w-76" />
        </div>
  
        </div>
      </div>
      <div className='flex'>
      <div className="flex items-center justify-center w-1/2">
        <img src={Quiz} alt="quiz" className="h-64 mx-auto w-76" />
      </div>
      <div class="w-1/2 ">
      <h1 className="mt-10 text-5xl font-bold text-gray-300 ">Ready to start the QuizMaster Experience? </h1>
      <p className="pt-8 pr-8 mb-10 text-2xl text-gray-300">Simply <a href = "/register"  className="underline">create an account</a> or <a href = "/login" className="underline">login</a> if you already have an account. Navigate to the <a href = "/quizzes"  className="underline">quizzes</a> page and select a quiz.</p>
      </div>
      </div>
    </div>
);

export default Home;
