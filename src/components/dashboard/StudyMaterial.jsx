import React, { useState, useEffect } from 'react';

const StudyMaterial = ({ category }) => {
  const [studyMaterial, setStudyMaterial] = useState(null);

  useEffect(() => {
    const fetchStudyMaterial = async () => {
      try {
        const response = await fetch(
          `https://us-central1-quizmaster-c66a2.cloudfunctions.net/getStudyMaterial?category=${category.toLowerCase()}`
        );
        if (!response.ok) throw new Error('Failed to fetch study material');
        const data = await response.json();
        setStudyMaterial(data);
      } catch (error) {
        console.error('Error fetching study material:', error);
        setStudyMaterial(null);
      }
    };

    fetchStudyMaterial();
  }, [category]);

  return (
    <div className="bg-white/5 border border-fuchsia-500 rounded-2xl p-8 text-white shadow-lg backdrop-blur-md transition-all hover:shadow-xl">
      {studyMaterial ? (
        <div className="space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text uppercase tracking-wide">
            {category} Study Material
          </h2>

          {/* Content */}
          <p className="text-sm leading-relaxed text-gray-200">
            {studyMaterial.content}
          </p>

          {/* Resources */}
          {studyMaterial.resources && studyMaterial.resources.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-pink-300 uppercase">
                Resources to Check Out
              </h3>
              <ul className="space-y-2 text-sm text-blue-300">
                {studyMaterial.resources.map((url, idx) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-fuchsia-400 transition-colors"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="italic text-gray-400 text-sm">No resources available.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Loading study material...</p>
      )}
    </div>
  );
};

export default StudyMaterial;
