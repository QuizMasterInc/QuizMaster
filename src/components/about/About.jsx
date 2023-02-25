import React from "react";
import Logo from "../../assets/logo.jpg";

const About = ({}) => (
  <div className="py-12 text-gray-300 bg-gray-800 shadow-lg hover:shadow-x">
    <div className="flex items-center justify-center">
      <img src={Logo} alt="logo" className="h-64 mx-auto w-76" />
    </div>

    <div className="flex items-center justify-center ">
      <h1 className="pt-5 mb-4 text-6xl font-bold text-center">About Us</h1>
    </div>
    <div className="flex flex-col mb-4 md:flex-row md:items-center">
      <div className="flex-1">
        <div className="info-div">
          <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl">
            <b className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl text-gray-300">
              QuizMaster
            </b>{" "}
            is a web based application intended for users to manage, take quizzes,
            and even create them! We want customers to have the ultimate experience
            with features like randomization of multiple choice questions.
            <br></br> Want to set a time limit? No problem. Users that take a quiz
            want to see immediate results but quiz creators will have the option to
            hide the correct answer and reveal them later.
          </p>
        </div>
      </div>
    </div>
    <div className="flex flex-col mb-4 md:flex-row md:items-center">
      <div className="flex-1">
        <div className="info-div">
          <p className="py-4 text-lg md:text-xl lg:text-2xl xl:text-3xl">
            <b className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl text-gray-300">
              Our Team
            </b>{" "}
            will be utilizing React.js, Firebase hosting, Tailwind CSS styling, and
            Golang for back-end support. Firestore will be used to store and update
            quizzes and quiz takers results.
            <br></br>Our developers are open to feedback! Feel free to contact our
            team thorught the contact us page with any suggestions or recommendations
            to improve QuizMaster.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default About;
