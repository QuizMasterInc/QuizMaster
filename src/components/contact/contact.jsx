import React from "react";
import max from "./img/max.jpg"
import anthony from "./img/anthony.jpg"
import matt from "./img/matt.jpg"

const Contact = () => {
  return (
    <div className="bg-gray-800 shadow-lg hover:shadow-x text-gray-300 pt-15">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2">
          <div>
            <h1 className="text-5xl font-bold text-gray-300">Quiz Master</h1>
            <h2 className="text-lg font-semibold text-gray-300">This site is still in development</h2>
          </div>
          
        </div>
      </div>
      <div className="flex justify-center items-center ">
        <h1 className="text-5xl font-bold text-center mb-4 pt-5">Contact Us</h1>
      </div>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <a href="https://lively-bay-020649610.2.azurestaticapps.net/" target = "_blank"><img src={max} alt="headshot" className="w-48 h-48 rounded-full object-cover" /></a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Maximus Lewis</h3>
            <div className="mt-2 text-gray-300">
              <a href="mailto:maximusslewis@lewisu.edu" className="hover:underline">
              maximusslewis@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <a href = "https://white-mud-0bcdbb710.1.azurestaticapps.net/" target = "_blank"><img src={anthony} alt="anthony"  className="w-48 h-48 rounded-full object-cover" /></a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Anthony Mastores</h3>
            <div className="mt-2 text-gray-300">
              <a href="mailto:anthonyjmastores@lewisu.edu" className="hover:underline">
                anthonyjmastores@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <a href = " https://assignment-portfolio-me.azurewebsites.net/getting-to-know-me-version-2.html" target = "_blank"><img src={matt} alt="matthew" className="w-48 h-48 rounded-full object-cover" /></a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Matthew Espinos</h3>
            <div className="mt-2 text-gray-300">
              <a href="mailto:matthewwespinos@lewisu.edu" className="hover:underline">
              matthewwespinos@lewisu.edu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Contact;

