import React from "react";
import max from "./img/max.jpg"
import anthony from "./img/anthony.jpg"
import matt from "./img/matt.jpg"

const Contact = () => {
  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quiz Master</h1>
            <h2 className="text-lg font-semibold text-gray-500">This site is still in development</h2>
          </div>
          <div className="text-right">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <img src={max} alt="headshot" className="w-48 h-48 rounded-full object-cover" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Maximus Lewis</h3>
            <div className="mt-2 text-gray-600">
              <a href="mailto:maximusslewis@lewisu.edu" className="hover:underline">
              maximusslewis@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <img src={anthony} alt="anthony"  className="w-48 h-48 rounded-full object-cover" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Anthony Mastores</h3>
            <div className="mt-2 text-gray-600">
              <a href="mailto:anthonyjmastores@lewisu.edu" className="hover:underline">
                anthonyjmastores@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <img src={matt} alt="matthew" className="w-48 h-48 rounded-full object-cover" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Matthew Espinos</h3>
            <div className="mt-2 text-gray-600">
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

