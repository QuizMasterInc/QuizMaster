import React from 'react';

function About() {
  return (
    <div>
      <div id="main-menu"></div>

      <div className="flex justify-center items-center ">
        <h1 className="text-3xl font-bold text-center mb-4">About us</h1>
      </div>

 
      <div className="flex flex-col md:flex-row md:items-center mb-4">
        <div className="flex-1">
          <div className="info-div">
            <p>
              <b>QuizMaster</b> is a web based application intended for users to manage, take quizzes, and even create them! We want customers to have the ultimate experience with features like randomization of multiple choice questions. Want to set a time limit? No problem. Users that take a quiz want to see immediate results but quiz creators will have the option to hide the correct answer and reveal them later.
            </p>
          </div>
        </div>

        
      </div>

      <div id="footer"></div>
    </div>
  );
}

export default About;
