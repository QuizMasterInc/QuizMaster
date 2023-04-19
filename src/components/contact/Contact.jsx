import React from "react";
import max from "../../assets/max.jpg"
import anthony from "../../assets/anthony.jpg"
import matt from "../../assets/matt.jpg"

const Contact = ({}) => (
  <div className="text-gray-300 bg-gray-800 shadow-lg hover:shadow-x pt-15">
  <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
      <div className="pl-10 text-left">
        <h1 className="text-4xl font-bold text-gray-300">Quiz Master</h1>
        <h2 className="text-lg font-semibold text-gray-300 ">
          This site is still in development
        </h2>
        </div>
        <div className="flex items-center justify-center ">
          <h1 className="pl-8 pt-5 mb-4 text-5xl font-bold text-center">Contact Us</h1>
        </div>
    </div>
    <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
      <div className="grid-cols-1 gap-6 flex flex-wrap justify-center">
        <div className="flex flex-col items-center">
          <a href="https://lively-bay-020649610.2.azurestaticapps.net/" target="_blank">
            <img src={max} alt="headshot" className="object-cover w-48 h-48 rounded-full" />
          </a>
          <h3 className="mt-4 text-lg font-medium text-gray-300">Maximus Lewis</h3>
          <div className="mt-2 text-gray-300">
            <a href="mailto:maximusslewis@lewisu.edu" className="hover:underline">
              maximusslewis@lewisu.edu
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <a href="https://anthonymastores.github.io/getting-to-know-eachother/" target="_blank">
            <img src={anthony} alt="anthony" className="object-cover w-48 h-48 rounded-full" />
          </a>
          <h3 className="mt-4 text-lg font-medium text-gray-300">Anthony Mastores</h3>
          <div className="mt-2 text-gray-300">
            <a href="mailto:anthonyjmastores@lewisu.edu" className="hover:underline">
              anthonyjmastores@lewisu.edu
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <a href="https://assignment-portfolio-me.azurewebsites.net/getting-to-know-me-version-2.html" target="_blank">
            <img src={matt} alt="matthew" className="object-cover w-48 h-48 rounded-full" />
          </a>
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
)

export default Contact;