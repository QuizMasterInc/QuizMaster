import React from "react";

// Importing images
import max from "../../assets/max.jpg"
import anthony from "../../assets/anthony.jpg"
import matt from "../../assets/matt.jpg"
import jose from "../../assets/jose.jpg"
import matthew from "../../assets/matthew.jpg"
import tyler from "../../assets/tyler.jpg"
import julie from "../../assets/julie.jpg"
import james from "../../assets/james.jpg"
import joey from "../../assets/joey.jpg"
import alexk from "../../assets/alexk.jpg"
import hamzeh from "../../assets/hamzeh.jpg"
import alex from "../../assets/alex.jpg"
import jeff from "../../assets/jeff.jpg"
import evan from "../../assets/evanh.jpg"
import logo from "../../assets/logo.jpg"
import danielj from "../../assets/daniel.jpg"
import jayrell from "../../assets/jayrell.jpg"
import hima from "../../assets/hima.jpg"
import brian from "../../assets/brian.jpg"
import ahmad from "../../assets/ahmad.jpg"
import sami from "../../assets/sami.jpg"
import erick from "../../assets/erick.jpg"
import demetrius from "../../assets/demetrius.jpg"
import nuvia from "../../assets/nuvia.jpg"

{/* IMPORT YOUR IMAGES ABOVE */}



const Contact = ({}) => (
    // Top-level container with text and background styling
  <div className="text-gray-300 bg-gray-800 shadow-lg hover:shadow-x pt-15">
  {/* Inner container for text content */}
    <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
    {/* Sub-container for the header and subtitle */}
      <div className="pl-10 text-left">
        <h1 className="text-4xl font-bold text-gray-300">Quiz Master</h1>
        <h2 className="text-lg font-semibold text-gray-300 ">
          This site is still in development
        </h2>
        </div>  
      {/* Sub-container for the "Contact Us" header */}
        <div className="flex items-center justify-center ">
          <h1 className="pl-8 pt-5 mb-4 text-5xl font-bold text-center">Contact Us</h1>
        </div>
    </div>

    {/* THIS IS THE INFORMATION FOR THE SPRING 2025 SacredMyth group*/}
    <div className="flex items-center justify-center ">
      <h1 className="pl-8 pt-5 mb-4 text-4xl font-bold text-center">Spring 2025 Team</h1>
    </div>
    
    {/* Container for contact information */}
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24">

        {/* Grid layout for contact information */}
        <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">
        <div className="flex flex-col items-center">
            <a href="https://demetrius-price02.github.io/my-static-web-app/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={demetrius} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Demetrius Price</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              SacredMyth Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:demetriusaprice@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                demetriusaprice@lewisu.edu
              </a>
            </div>
          </div>

        <div className="flex flex-col items-center">
        <a href="https://samdwag.github.io/Salzoubi/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={sami} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Sami Alzoubi</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              SacredMyth Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:samialzoubi@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                samialzoubi@lewisu.edu
              </a>
            </div>
          </div>

        <div className="flex flex-col items-center">
        <a href="https://node-js-portfolio-ajb8b4grbscbe0a6.centralus-01.azurewebsites.net/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={erick} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Erick Martinez</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              SacredMyth Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:erickrmartinezzepeda@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                erickrmartinezzepeda@lewisu.edu
              </a>
            </div>
          </div>

        </div>
      </div>  

      <div className="flex flex-col items-center">
        <a href="https://purple-field-031659910.5.azurestaticapps.net/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={nuvia} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Nuvia Hernandez</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              SacredMyth Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:nuviahernandez@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                nuviahernandez@lewisu.edu
              </a>
            </div>
          </div>

        
        
    {/* THIS IS THE INFORMATION FOR THE FALL 2024 ChairForceOne group*/}

    <div className="flex items-center justify-center ">
      <h1 className="pl-8 pt-5 mb-4 text-4xl font-bold text-center">Fall 2024 Team</h1>
    </div>
    {/* Container for contact information */}
    <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        {/* Grid layout for contact information */}
        <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">
        <div className="flex flex-col items-center">
            <a href="https://yellow-ocean-0fcfe0910.4.azurestaticapps.net" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={danielj} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Daniel Jazowski</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              ChairForceOne Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:danieljjazowski@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                danieljjazowski@lewisu.edu
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <a href="https://jayrellg.github.io/me/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={jayrell} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Jayrell Garcia</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              ChairForceOne Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:jayrellgarcia@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                jayrellgarcia@lewisu.edu
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <a href="https://hmadhavann.github.io/me/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={hima} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Hima Madhavan</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              ChairForceOne Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:himajmadhavan@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                himajmadhavan@lewisu.edu
              </a>
            </div>
          </div> 
          <div className="flex flex-col items-center">
            <a href="https://briang38.github.io/me/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={brian} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Brian Gutt</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              ChairForceOne Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:brianmgutt@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                brianmgutt@lewisu.edu
              </a>
            </div>
          </div> 
          <div className="flex flex-col items-center">
            <a href="https://nice-stone-0faf59710.4.azurestaticapps.net/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={ahmad} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Ahmad Yousuf</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              ChairForceOne Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:ahmadoyousuf@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                ahmadoyousuf@lewisu.edu
              </a>
            </div>
          </div> 
        </div>
      </div>    

     {/* THIS IS THE INFORMATION FOR THE SPRING 2024 TEAM*/}


     <div className="flex items-center justify-center ">
      <h1 className="pl-8 pt-5 mb-4 text-4xl font-bold text-center">Spring 2024 Team</h1>
    </div>
     {/* Container for contact information */}
     <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
      {/* Grid layout for contact information */}
      <div className="grid-cols-1 gap-6 flex flex-wrap justify-center">
          <div className="flex flex-col items-center">
            <a href="https://ashy-mud-0329c4e10.3.azurestaticapps.net/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={alexk} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Alex Kaminski</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              Core2 Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:alexmkaminski@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

              alexmkaminski@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <a href="https://jamesmackowiak.github.io/about.html" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={james} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">James Mackowiak</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              Core2 Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:jamesvmackowiak@lewisu.edu" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}
                jamesvmackowiak@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
              <a href="https://halbaz.github.io" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
                <img src={hamzeh} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
              </a>
              <h3 className="mt-4 text-lg font-medium text-gray-300">Hamzeh Albaz</h3> {/* YOUR NAME GOES HERE */}
              <div className="mt-0 text-gray-300">
              Core2 Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

                <a href="mailto:hamzehoalbaz@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}

                  hamzehoalbaz@lewisu.edu
                </a>
              </div>
            </div>
        </div>

        {/* SECOND ROW */}
        <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">
          <div className="flex flex-col items-center">
            <a href="https://github.com/alexh1424" target="_blank">
              <img src={alex} alt="headshot" className="object-cover w-48 h-48 rounded-full" />
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Alex Hernandez</h3>
            <div className="mt-0 text-gray-300">
              Core2 Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:alexhernandez@lewisu.edu" target="_blank" className="hover:underline">

              alexhernandez@lewisu.edu
              </a>
            </div>
          </div>
          {/* REPLACE WITH TEAM MEMBER 5 */}
          <div className="flex flex-col items-center">
            <a href="https://github.com/raxtt" target="_blank">
              <img src={evan} alt="headshot" className="object-cover w-48 h-48 rounded-full" />
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Evan Hartke</h3>
            <div className="mt-0 text-gray-300">
              Core2 Group
            </div>
            <div className="mt-2 text-sm text-gray-400">

              <a href="mailto:evanmhartke@lewisu.edu" target="_blank" className="hover:underline">

              evanmhartke@lewisu.edu
              </a>
            </div>
          </div>
        </div>
      </div>
    
    {/* THIS IS THE INFORMATION FOR THE FALL 2023 TEAM*/}

    <div className="flex items-center justify-center ">
      <h1 className="pl-8 pt-5 mb-4 text-4xl font-bold text-center">Fall 2023 Team</h1>
    </div>
    {/* Container for contact information */}
    <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        {/* Grid layout for contact information */}
        <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">
          <div className="flex flex-col items-center">
            <a href="https://josemdo.github.io/Getting-to-Know-Eachother/" target="_blank">
              <img src={jose} alt="headshot" className="object-cover w-48 h-48 rounded-full" />
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Jose Montes De Oca Morfin</h3>
            <div className="mt-0 text-gray-300">
              Core Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:joseamontesdeocamo@lewisu.edu" target="_blank" className="hover:underline">
                joseamontesdeocamo@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <a href="https://red-coast-075a6b510.3.azurestaticapps.net" target="_blank">
              <img src={matthew} alt="Matthew" className="object-cover w-48 h-48 rounded-full" />
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Matthew Senese</h3>
            <div className="mt-0 text-gray-300">
              Core Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:matthewjsenese@lewisu.edu" target="_blank" className="hover:underline">
                matthewjsenese@lewisu.edu
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <a href="https://lemon-stone-0f92af610.3.azurestaticapps.net/" target="_blank">
              <img src={julie} alt="Julie" className="object-cover w-48 h-48 rounded-full" />
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Julie Dosher</h3>
            <div className="mt-0 text-gray-300">
              Core Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:juliegdosher@lewisu.edu" target="_blank" className="hover:underline">
                juliegdosher@lewisu.edu
              </a>
            </div>
          </div>
        </div>
        
        {/* SECOND ROW FOR THE FALL 2023 TEAM*/}
        <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">
          <div className="flex flex-col items-center">
            <a href="https://node-js-azure-fa23-tyler-site.azurewebsites.net" target="_blank">
              <img src={tyler} alt="headshot" className="object-cover w-48 h-48 rounded-full" />
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Tyler Zenisek</h3>
            <div className="mt-0 text-gray-300">
              Core Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:tylerzenisek@lewisu.edu" target="_blank" className="hover:underline">
                tylerzenisek@lewisu.edu
              </a>
            </div>
          </div>
          {/* REPLACE WITH TEAM MEMBER 5 */}
          <div className="flex flex-col items-center">
            <a href="https://github.com/JahiStewart" target="_blank">
              <img src={logo} alt="headshot" className="object-cover w-48 h-48 rounded-full" />
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Jahi Stewart</h3>
            <div className="mt-0 text-gray-300">
              Core Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:jahikstewart@lewisu.edu" target="_blank" className="hover:underline">
              jahikstewart@lewisu.edu
              </a>
            </div>
          </div>
        </div>

        {/*THIRD ROW FOR FALL 2023 TEAM */ }
        <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">

          {/* THIS SECTION IS FOR JEFFERSON CHERRINGTON */}

          <div className="flex flex-col items-center">
            <a href="https://jacnok.github.io/cpsc-44000-s1-helloworld/intro.html" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={jeff} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Jefferson Cherrington</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              NextGen Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:jeffersonacherring@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}
              jeffersonacherring@lewisu.edu
              </a>
            </div>
          </div>

          

          


          {/* THIS SECTION IS FOR JOEY DEVITO */}

          <div className="flex flex-col items-center">
            <a href="https://getting-2-know-you.azurewebsites.net/" target="_blank"> {/* REPLACE MY GETTING TO KNOW EACHOTHER LINK WITH YOURS */}
              <img src={joey} alt="headshot" className="object-cover w-48 h-48 rounded-full" /> {/* REPLACE MY IMAGE SRC WITH YOUR IMAGE IMPORT NAME */}
            </a>
            <h3 className="mt-4 text-lg font-medium text-gray-300">Joey Devito</h3> {/* YOUR NAME GOES HERE */}
            <div className="mt-0 text-gray-300">
              NextGen Group
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <a href="mailto:josephmdevito@lewisu.edu" target="_blank" className="hover:underline"> {/* REPLACE MY EMAIL WITH YOUR EMAIL BOTH IN THE HREF AND IN THE TEXT ITSELF */}
                josephmdevito@lewisu.edu
              </a>
            </div>
          </div>      
        </div>

        {/*FINAL ROW FOR FALL 2023 TEAM*/ }
        <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">

        {/* THIS SECTION IS FOR THE LAST TEAM MEMBER (HAMZEH) */}

          
        </div>
    </div>


    {/* THIS IS THE INFORMATION FOR THE SPRING 2023 TEAM*/}


    <div className="flex items-center justify-center ">
      <h1 className="pl-8 pt-5 mb-4 text-4xl font-bold text-center">Spring 2023 Team</h1>
    </div>
     {/* Container for contact information */}
     <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
      {/* Grid layout for contact information */}
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
            <a href="mailto:anthonyjmastores@lewisu.edu" target="_blank" className="hover:underline">
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
            <a href="mailto:matthewwespinos@lewisu.edu" target="_blank" className="hover:underline">
              matthewwespinos@lewisu.edu
            </a>
          </div>
        </div>
      </div>
  </div>
</div>
)

export default Contact;
