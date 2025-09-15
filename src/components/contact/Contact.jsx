import React, { useState } from "react";

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
import kolade from "../../assets/kolade.jpg"
import rudra from "../../assets/rudra.jpg"
import ben from "../../assets/ben.jpg"
import ethan from "../../assets/ethan.jpg"

const TeamSection = ({ title, isOpen = false, children }) => {
    const [expanded, setExpanded] = useState(isOpen);
    return (
        <>
            <div className="flex flex-col items-center justify-center my-12">
                <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 transition-all duration-300 hover:scale-105">
                    <div className="flex flex-col items-center">
                        <h2 className="text-gradient-primary text-4xl font-bold">
                            {title}
                        </h2>
                        <div className="mt-2 h-1 w-full rounded-full bg-accent" />
                    </div>
                    <span className={`text-4xl font-bold text-accent transition-transform duration-300 ${expanded ? 'rotate-45' : ''}`}>
                        +
                    </span>
                </button>
            </div>
            {expanded && (
                <div className="py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24 border-t border-primary mt-12">
                    <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};





const TeamMember = ({ image, name, group, email, githubLink }) => (
    <div className="flex flex-col items-center bg-card border border-primary rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <a href={githubLink} target="_blank" rel="noopener noreferrer">
            <img src={image} alt={name} className="object-cover w-48 h-48 rounded-full border-2 border-accent transition-all duration-300 hover:border-accent-hover" />
        </a>
        <h3 className="mt-4 text-lg font-medium text-primary">{name}</h3>
        <div className="mt-1 text-accent font-medium">{group}</div>
        <div className="mt-2 text-sm text-secondary">
            <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent transition-colors duration-200">
                {email}
            </a>
        </div>
    </div>
);

const Contact = () => (
    <div className="relative min-h-screen pt-15 bg-primary text-primary">
        <div className="relative z-10">
            <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-gradient-primary text-5xl font-bold">
                        Contact Us
                    </h1>
                    <div className="mt-4 h-1 w-48 rounded-full bg-accent" />
                </div>
            </div>


            <div className="py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12 2xl:px-24 mt-12">
                <h2 className="text-gradient-primary text-4xl font-bold text-center mb-12">
                    Fall 2025 Team
                </h2>
                <div className="grid-cols-1 gap-6 flex flex-wrap justify-center mt-8">
                    <TeamMember
                        image={ben}
                        name="Benjamin Eiler"
                        group="TitanicSwimTeam Group"
                        email="benjaminseiler@lewisu.edu"
                        githubLink="https://github.com/beneiler"
                    />
                    <TeamMember
                        image={rudra}
                        name="Rudra Patel"
                        group="TitanicSwimTeam Group"
                        email="rudrappatel@lewisu.edu"
                        githubLink="https://github.com/rpat9"
                    />
                    <TeamMember
                        image={kolade}
                        name="Kolade Idris"
                        group="TitanicSwimTeam Group"
                        email="koladeidris@lewisu.edu"
                        githubLink="https://github.com/marskidris"
                    />
                    <TeamMember
                        image={ethan}
                        name="Ethan Myers"
                        group="TitanicSwimTeam Group"
                        email="ethanamyers@lewisu.edu"
                        githubLink="https://github.com/ethanmy14"
                    />
                </div>
            </div>


            <TeamSection title="Spring 2025 Team">
                <TeamMember
                    image={demetrius}
                    name="Demetrius Price"
                    group="SacredMyth Group"
                    email="demetriusaprice@lewisu.edu"
                    githubLink="https://demetrius-price02.github.io/my-static-web-app/"
                />
                <TeamMember
                    image={sami}
                    name="Sami Alzoubi"
                    group="SacredMyth Group"
                    email="samialzoubi@lewisu.edu"
                    githubLink="https://samdwag.github.io/Salzoubi/"
                />
                <TeamMember
                    image={erick}
                    name="Erick Martinez"
                    group="SacredMyth Group"
                    email="erickrmartinezzepeda@lewisu.edu"
                    githubLink="https://node-js-portfolio-ajb8b4grbscbe0a6.centralus-01.azurewebsites.net/"
                />
                <TeamMember
                    image={nuvia}
                    name="Nuvia Hernandez"
                    group="SacredMyth Group"
                    email="nuviahernandez@lewisu.edu"
                    githubLink="https://purple-field-031659910.5.azurestaticapps.net/"
                />
            </TeamSection>

            <TeamSection title="Fall 2024 Team">
                <TeamMember
                    image={danielj}
                    name="Daniel Jazowski"
                    group="ChairForceOne Group"
                    email="danieljjazowski@lewisu.edu"
                    githubLink="https://yellow-ocean-0fcfe0910.4.azurestaticapps.net"
                />
                <TeamMember
                    image={jayrell}
                    name="Jayrell Garcia"
                    group="ChairForceOne Group"
                    email="jayrellgarcia@lewisu.edu"
                    githubLink="https://jayrellg.github.io/me/"
                />
                <TeamMember
                    image={hima}
                    name="Hima Madhavan"
                    group="ChairForceOne Group"
                    email="himajmadhavan@lewisu.edu"
                    githubLink="https://hmadhavann.github.io/me/"
                />
                <TeamMember
                    image={brian}
                    name="Brian Gutt"
                    group="ChairForceOne Group"
                    email="brianmgutt@lewisu.edu"
                    githubLink="https://briang38.github.io/me/"
                />
                <TeamMember
                    image={ahmad}
                    name="Ahmad Yousuf"
                    group="ChairForceOne Group"
                    email="ahmadoyousuf@lewisu.edu"
                    githubLink="https://nice-stone-0faf59710.4.azurestaticapps.net/"
                />
            </TeamSection>

            <TeamSection title="Spring 2024 Team">
                <TeamMember
                    image={alexk}
                    name="Alex Kaminski"
                    group="Core2 Group"
                    email="alexmkaminski@lewisu.edu"
                    githubLink="https://ashy-mud-0329c4e10.3.azurestaticapps.net/"
                />
                <TeamMember
                    image={james}
                    name="James Mackowiak"
                    group="Core2 Group"
                    email="jamesvmackowiak@lewisu.edu"
                    githubLink="https://jamesmackowiak.github.io/about.html"
                />
                <TeamMember
                    image={hamzeh}
                    name="Hamzeh Albaz"
                    group="Core2 Group"
                    email="hamzehoalbaz@lewisu.edu"
                    githubLink="https://halbaz.github.io"
                />
                <TeamMember
                    image={alex}
                    name="Alex Hernandez"
                    group="Core2 Group"
                    email="alexhernandez@lewisu.edu"
                    githubLink="https://github.com/alexh1424"
                />
                <TeamMember
                    image={evan}
                    name="Evan Hartke"
                    group="Core2 Group"
                    email="evanmhartke@lewisu.edu"
                    githubLink="https://github.com/raxtt"
                />
            </TeamSection>

            <TeamSection title="Fall 2023 Team">
                <TeamMember
                    image={jose}
                    name="Jose Montes De Oca Morfin"
                    group="Core Group"
                    email="joseamontesdeocamo@lewisu.edu"
                    githubLink="https://josemdo.github.io/Getting-to-Know-Eachother/"
                />
                <TeamMember
                    image={matthew}
                    name="Matthew Senese"
                    group="Core Group"
                    email="matthewjsenese@lewisu.edu"
                    githubLink="https://red-coast-075a6b510.3.azurestaticapps.net"
                />
                <TeamMember
                    image={julie}
                    name="Julie Dosher"
                    group="Core Group"
                    email="juliegdosher@lewisu.edu"
                    githubLink="https://lemon-stone-0f92af610.3.azurestaticapps.net/"
                />
                <TeamMember
                    image={tyler}
                    name="Tyler Zenisek"
                    group="Core Group"
                    email="tylerzenisek@lewisu.edu"
                    githubLink="https://node-js-azure-fa23-tyler-site.azurewebsites.net"
                />
                <TeamMember
                    image={logo}
                    name="Jahi Stewart"
                    group="Core Group"
                    email="jahikstewart@lewisu.edu"
                    githubLink="https://github.com/JahiStewart"
                />
                <TeamMember
                    image={jeff}
                    name="Jefferson Cherrington"
                    group="NextGen Group"
                    email="jeffersonacherring@lewisu.edu"
                    githubLink="https://jacnok.github.io/cpsc-44000-s1-helloworld/intro.html"
                />
                <TeamMember
                    image={joey}
                    name="Joey Devito"
                    group="NextGen Group"
                    email="josephmdevito@lewisu.edu"
                    githubLink="https://getting-2-know-you.azurewebsites.net/"
                />
            </TeamSection>

            <TeamSection title="Spring 2023 Team">
                <TeamMember
                    image={max}
                    name="Maximus Lewis"
                    group="Spring 2023"
                    email="maximusslewis@lewisu.edu"
                    githubLink="https://lively-bay-020649610.2.azurestaticapps.net/"
                />
                <TeamMember
                    image={anthony}
                    name="Anthony Mastores"
                    group="Spring 2023"
                    email="anthonyjmastores@lewisu.edu"
                    githubLink="https://anthonymastores.github.io/getting-to-know-eachother/"
                />
                <TeamMember
                    image={matt}
                    name="Matthew Espinos"
                    group="Spring 2023"
                    email="matthewwespinos@lewisu.edu"
                    githubLink="https://assignment-portfolio-me.azurewebsites.net/getting-to-know-me-version-2.html"
                />
            </TeamSection>


        </div>
    </div>
);

export default Contact;
