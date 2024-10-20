import React, { useState, useEffect } from 'react';

const StudyMaterial = ({ category }) => {
  const [studyMaterial, setStudyMaterial] = useState(null);

  useEffect(() => {
    const fetchStudyMaterial = async () => {
      try {
        const response = await fetch('https://us-central1-quizmaster-c66a2.cloudfunctions.net/getStudyMaterial?category=' + category.toLowerCase());
        if (!response.ok) {
          throw new Error("Failed to fetch study material");
        }
        const data = await response.json();
        setStudyMaterial(data);
        console.log(data)
      } catch (error) {
        console.error("Error fetching study material:", error);
        setStudyMaterial(null);
      }
    };

    fetchStudyMaterial();
  }, [category]);

  return (
    <div>
      {studyMaterial ? (
        <div>
          <h2 className="text-gray-300">{category} Study Material</h2>
          <p className="text-gray-300">This is the study material for {category}.</p>
          <p className="text-gray-300">{studyMaterial.content}</p>

         
          {studyMaterial.resources && studyMaterial.resources.length > 0 ? ( //Checks if there are any resources in the studyMaterial object
            <div>
              <h3 className="text-gray-300"> Resources to Check Out: </h3>
              <ul>
                {studyMaterial.resources.map((article, index) => //Maps through each resource and creates a list item
                  <li key = {index}>
                    <a href= {article} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                      {article}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <p ClassName="text-gray-300"> No resources available</p>
          )}
        </div>
      ) : (
        <p className="text-gray-300">Loading...</p>
      )}
    </div>
  );
};

export default StudyMaterial;