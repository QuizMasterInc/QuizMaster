import React from 'react';
import Logo from "../icons/logo.jpg";


function About() {
  return (
    <div className="bg-gray-800 shadow-lg hover:shadow-x text-gray-300 ">
      <div className="flex justify-center items-center">
        <img src={Logo} alt="logo" className="mx-auto w-76 h-64" />
      </div>

      <div className="flex justify-center items-center ">
        <h1 className="text-5xl font-bold text-center mb-4 pt-5">About Us</h1>
      </div>

 
      <div className="flex flex-col md:flex-row md:items-center mb-4" >
        <div className="flex-1">
          <div className="info-div">
            <p>
              <b className = "text-gray-300 text-3xl" >QuizMaster</b> is a web based application intended for users to manage, take quizzes, and even create them! We want customers to have the ultimate experience with features like randomization of multiple choice questions.
              <br></br> Want to set a time limit? No problem. Users that take a quiz want to see immediate results but quiz creators will have the option to hide the correct answer and reveal them later.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center mb-4" >
        <div className="flex-1">
          <div className="info-div">
            <p>
              <b className = "text-gray-300 text-3xl" >Our Team</b> will be utilizing React.js, Firebase hosting, Tailwwind CSS styling, and Golang for back-end support. Firestore will be used to store and update quizzes and quiz takers results.
              <br></br>Our developers are open to feedback! Feel free to contact our team thorught the contact us page with any suggestions or recommendations to improve QuizMaster. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
